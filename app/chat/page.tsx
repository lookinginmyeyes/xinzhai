'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import EmotionTag from '@/components/EmotionTag';
import MicroAction from '@/components/MicroAction';
import { Message, CheckIn, EmotionType, Memory } from '@/types';
import { storage } from '@/lib/storage';
import { parseSummary } from '@/lib/prompts';
import { emotionLabelToType, extractMemory, detectEmotion } from '@/lib/emotion';

// 欢迎语模板
const GREETINGS = [
  '嗨，今天感觉怎么样？',
  '你好呀，今天心情如何？',
  '又见面了，有什么想聊的吗？',
];

// 触发总结的关键词
const SUMMARY_TRIGGER_WORDS = [
  '没了', '就这些', '没什么了', '好了', '说完', '没有了',
  '结束', '拜拜', '再见', ' bye', '先这样', '差不多', '聊完了',
  '暂时这样', '先到这', '不聊了', '下线', '可以的', '行吧'
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [summary, setSummary] = useState<{
    emotion: EmotionType;
    keywords: string[];
    microAction: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<Message[]>([]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化欢迎语
  useEffect(() => {
    const lastDate = storage.getLastCheckInDate();
    const today = new Date().toISOString().split('T')[0];

    let greeting: string;
    if (lastDate && lastDate !== today) {
      greeting = '好久不见，这两天过得怎么样？';
    } else {
      greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    }

    const initialMsg = [{
      role: 'assistant' as const,
      content: greeting,
      timestamp: Date.now(),
    }];
    setMessages(initialMsg);
    conversationRef.current = initialMsg;
  }, []);

  // 保存签到记录
  const saveCheckInRecord = async (allMessages: Message[], emotion: EmotionType, keywords: string[], microAction: string) => {
    const checkIn: CheckIn = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      emotion,
      keywords,
      microAction,
      conversation: allMessages,
      createdAt: new Date().toISOString(),
    };

    console.log('Saving checkIn:', checkIn);
    await storage.saveCheckIn(checkIn);

    // 提取并保存记忆
    const allUserText = allMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    const memoryContent = extractMemory(allUserText);
    if (memoryContent) {
      const memory: Memory = {
        id: Date.now().toString(),
        content: memoryContent,
        emotion,
        createdAt: new Date().toISOString(),
      };
      await storage.saveMemory(memory);
    }
  };

  // 发送消息
  const handleSend = async (text: string) => {
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    conversationRef.current = newMessages;

    // 检查是否触发总结
    const shouldSummarize = SUMMARY_TRIGGER_WORDS.some(word => text.includes(word));
    const messageCount = newMessages.filter(m => m.role === 'user').length;
    const needsSummary = shouldSummarize || messageCount >= 6;

    setIsTyping(true);

    try {
      const memories = storage.getMemories().slice(-3).map(m => m.content);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          memories,
          isSummary: needsSummary,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: data.content,
          timestamp: Date.now(),
        };

        const updatedMessages = [...newMessages, aiMessage];
        setMessages(updatedMessages);
        conversationRef.current = updatedMessages;

        // 如果是总结，解析并保存
        if (needsSummary) {
          let emotion: EmotionType = 'calm';
          let keywords: string[] = ['日常'];
          let microAction: string = '深呼吸放松一下';

          const parsed = parseSummary(data.content);
          if (parsed) {
            emotion = emotionLabelToType(parsed.emotion);
            keywords = parsed.keywords;
            microAction = parsed.microAction;
          } else {
            // 解析失败时，从对话中推断
            const allUserText = newMessages
              .filter(m => m.role === 'user')
              .map(m => m.content)
              .join(' ');
            emotion = detectEmotion(allUserText);
          }

          setSummary({ emotion, keywords, microAction });
          setIsComplete(true);

          // 保存签到记录
          saveCheckInRecord(updatedMessages, emotion, keywords, microAction);
        }
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: '抱歉，出了点问题，能再说一次吗？',
          timestamp: Date.now(),
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '网络不太稳定，再试一次？',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 手动结束签到
  const handleManualEnd = () => {
    const allMessages = conversationRef.current;

    // 从对话中推断情绪
    const allUserText = allMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    const emotion = detectEmotion(allUserText);
    const keywords = ['日常记录'];
    const microAction = '深呼吸，放松一下';

    setSummary({ emotion, keywords, microAction });
    setIsComplete(true);

    // 保存签到记录
    saveCheckInRecord(allMessages, emotion, keywords, microAction);
  };

  const handleComplete = () => {
    router.push('/');
    router.refresh();
  };

  // 计算用户发言轮数
  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const canEndCheckIn = userMessageCount >= 3 && !isComplete && !isTyping;

  // 右上角结束按钮
  const endButton = (
    <button
      onClick={handleManualEnd}
      disabled={!canEndCheckIn}
      className={`text-sm px-3 py-1 rounded-full transition-all ${
        canEndCheckIn
          ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
          : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'
      }`}
    >
      结束
    </button>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={isComplete ? '签到完成' : '签到中'}
        showBack
        rightAction={!isComplete ? endButton : undefined}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {messages.map((msg, index) => (
          <ChatBubble
            key={index}
            role={msg.role === 'assistant' ? 'ai' : 'user'}
            content={msg.content}
          />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-[var(--color-surface-elevated)] rounded-[18px] rounded-bl-[4px] px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {isComplete && summary && (
          <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border-light)]">
            <p className="text-center text-[var(--color-text-secondary)] text-sm mb-3">签到完成 ✨</p>
            <div className="flex justify-center mb-3">
              <EmotionTag emotion={summary.emotion} />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {summary.keywords.map((kw, i) => (
                <span key={i} className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
            <MicroAction action={summary.microAction} />
            <button
              onClick={handleComplete}
              className="w-full mt-4 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              完成
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isComplete && (
        <div className="border-t border-[var(--color-border-light)] bg-[var(--color-background)] p-3">
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import EmotionTag from '@/components/EmotionTag';
import MicroAction from '@/components/MicroAction';
import { Message, CheckIn, EmotionType, Memory } from '@/types';
import { storage } from '@/lib/storage';
import { parseSummary } from '@/lib/prompts';
import { emotionLabelToType, extractMemory, detectEmotion } from '@/lib/emotion';
import { supabase } from '@/lib/supabase';

const SUMMARY_TRIGGER_WORDS = [
  '没了', '就这些', '没什么了', '好了', '说完', '没有了',
  '结束', '拜拜', '再见', 'bye', '先这样', '差不多', '聊完了',
  '暂时这样', '先到这', '不聊了', '下线', '可以的', '行吧'
];

function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('xinzhai_anon_user_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('xinzhai_anon_user_id', id); }
  return id;
}

async function loadProfile() {
  const id = getAnonId();
  const { data } = await supabase.from('user_settings').select('*').eq('id', id).single();
  return data || {};
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [checkInComplete, setCheckInComplete] = useState(false);
  const [summary, setSummary] = useState<{
    emotion: EmotionType;
    keywords: string[];
    microAction: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<Message[]>([]);
  const profileRef = useRef<Record<string, string>>({});
  const memoriesRef = useRef<string[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [messages]);

  useEffect(() => {
    const init = async () => {
      const [prof, mems] = await Promise.all([
        loadProfile(),
        storage.fetchMemories(),
      ]);
      profileRef.current = prof;
      memoriesRef.current = mems.slice(0, 5).map((m: Memory) => m.content);

      const lastDate = storage.getLastCheckInDate();
      const today = new Date().toISOString().split('T')[0];
      const daysSince = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
        : null;

      let greeting = '嗨，今天感觉怎么样？';
      if (memoriesRef.current.length > 0 && daysSince && daysSince >= 2) {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: '打招呼' }],
              memories: memoriesRef.current,
              profile: prof,
              systemOverride: `你是心斋，用户${daysSince}天没来了。根据你对用户的了解，用一句温暖自然的话打招呼，引用你记得的内容，像老朋友一样。15字以内。`,
            }),
          });
          const data = await res.json();
          greeting = data.content || greeting;
        } catch { /* 使用默认 */ }
      } else {
        const gs = ['嗨，今天感觉怎么样？', '你好呀，今天心情如何？', '又见面了，有什么想聊的吗？'];
        greeting = gs[Math.floor(Math.random() * gs.length)];
      }

      const initial: Message = { role: 'assistant', content: greeting, timestamp: Date.now() };
      setMessages([initial]);
      conversationRef.current = [initial];
    };
    init();
  }, []);

  const getContextMessages = (msgs: Message[]): Message[] => {
    const userMsgs = msgs.filter(m => m.role === 'user');
    if (userMsgs.length <= 30) return msgs;
    const recent = msgs.slice(-40);
    const older = msgs.slice(0, -40);
    const sum = older.filter(m => m.role === 'user').map(m => m.content).join('；');
    return [{ role: 'assistant', content: `[之前对话摘要：${sum.slice(0, 200)}]`, timestamp: 0 }, ...recent];
  };

  const extractAndSaveMemory = async (allMessages: Message[], emotion: EmotionType) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages.slice(-20),
          memories: [],
          profile: profileRef.current,
          isExtractMemory: true,
        }),
      });
      const data = await res.json();
      if (data.content) {
        const lines = data.content.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        for (const line of lines.slice(0, 3)) {
          await storage.saveMemory({ id: Date.now().toString(), content: line, emotion, createdAt: new Date().toISOString() });
        }
      }
    } catch {
      const allUserText = allMessages.filter(m => m.role === 'user').map(m => m.content).join(' ');
      const content = extractMemory(allUserText);
      if (content) await storage.saveMemory({ id: Date.now().toString(), content, emotion, createdAt: new Date().toISOString() });
    }
  };

  const saveCheckIn = async (allMessages: Message[], emotion: EmotionType, keywords: string[], microAction: string) => {
    const checkIn: CheckIn = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      emotion, keywords, microAction,
      conversation: allMessages,
      createdAt: new Date().toISOString(),
    };
    await storage.saveCheckIn(checkIn);
    await extractAndSaveMemory(allMessages, emotion);
  };

  const handleSend = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    conversationRef.current = newMessages;
    setIsTyping(true);

    const userCount = newMessages.filter(m => m.role === 'user').length;
    const shouldSummarize = !checkInComplete && SUMMARY_TRIGGER_WORDS.some(w => text.toLowerCase().includes(w));
    const needsSummary = shouldSummarize && userCount >= 2;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: getContextMessages(newMessages),
          memories: memoriesRef.current,
          profile: profileRef.current,
          isSummary: needsSummary,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const aiMsg: Message = { role: 'assistant', content: data.content, timestamp: Date.now() };
        const updated = [...newMessages, aiMsg];
        setMessages(updated);
        conversationRef.current = updated;

        if (needsSummary) {
          let emotion: EmotionType = 'calm';
          let keywords = ['日常'];
          let microAction = '深呼吸放松一下';
          const parsed = parseSummary(data.content);
          if (parsed) {
            emotion = emotionLabelToType(parsed.emotion);
            keywords = parsed.keywords;
            microAction = parsed.microAction;
          } else {
            emotion = detectEmotion(newMessages.filter(m => m.role === 'user').map(m => m.content).join(' '));
          }
          setSummary({ emotion, keywords, microAction });
          setCheckInComplete(true);
          await saveCheckIn(updated, emotion, keywords, microAction);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，出了点问题，能再说一次吗？', timestamp: Date.now() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络不太稳定，再试一次？', timestamp: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleManualEnd = () => {
    const allMessages = conversationRef.current;
    const emotion = detectEmotion(allMessages.filter(m => m.role === 'user').map(m => m.content).join(' '));
    setSummary({ emotion, keywords: ['日常记录'], microAction: '深呼吸，放松一下' });
    setCheckInComplete(true);
    saveCheckIn(allMessages, emotion, ['日常记录'], '深呼吸，放松一下');
  };

  const userMessageCount = messages.filter(m => m.role === 'user').length;
  const canEnd = userMessageCount >= 3 && !checkInComplete && !isTyping;

  return (
    <div className="flex flex-col h-dvh min-h-0 overflow-hidden">
      <Header
        title={checkInComplete ? '自由对话' : '签到中'}
        showBack
        rightAction={
          !checkInComplete ? (
            <button
              onClick={handleManualEnd}
              disabled={!canEnd}
              className={`text-sm px-3 py-1 rounded-full transition-all ${
                canEnd
                  ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                  : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'
              }`}
            >
              结束签到
            </button>
          ) : undefined
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-4 py-4 animate-fade-in [scrollbar-gutter:stable]">
        {messages.map((msg, index) => (
          <ChatBubble key={index} role={msg.role === 'assistant' ? 'ai' : 'user'} content={msg.content} />
        ))}

        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-[var(--color-surface-elevated)] rounded-[18px] rounded-bl-[4px] px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--color-text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {checkInComplete && summary && (
          <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-sm border border-[var(--color-border-light)]">
            <p className="text-center text-[var(--color-text-secondary)] text-sm mb-3">签到完成 ✨ 继续聊也没问题</p>
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
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-[var(--color-border-light)] bg-[var(--color-background)] p-3">
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}

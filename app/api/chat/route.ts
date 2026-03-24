import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/ai';
import { SYSTEM_PROMPT, MEMORY_TEMPLATE, SUMMARY_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, memories, isSummary } = body;

    // 构建系统提示
    let systemPrompt = SYSTEM_PROMPT;
    if (memories && memories.length > 0) {
      systemPrompt += MEMORY_TEMPLATE(memories);
    }

    // 如果是总结请求，添加总结提示
    if (isSummary) {
      systemPrompt += '\n\n' + SUMMARY_PROMPT;
    }

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await chat(fullMessages);

    return NextResponse.json({ success: true, content: response });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { success: false, error: '对话出错，请稍后重试' },
      { status: 500 }
    );
  }
}
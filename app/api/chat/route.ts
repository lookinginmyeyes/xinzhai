import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/ai';
import { buildSystemPrompt, EXTRACT_MEMORY_PROMPT, parseSummary, SUMMARY_PROMPT } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, memories = [], profile = {}, isSummary, isExtractMemory } = body;

    const systemPrompt = buildSystemPrompt(memories, profile);

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
    ];

    if (isSummary) {
      fullMessages.push({ role: 'user', content: SUMMARY_PROMPT });
    }

    if (isExtractMemory) {
      fullMessages.push({ role: 'user', content: EXTRACT_MEMORY_PROMPT });
    }

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

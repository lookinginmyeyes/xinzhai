// AI API 调用封装 - 使用阿里云 DashScope (兼容 OpenAI 协议)

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  // 直接读取环境变量
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const baseUrl = process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1';
  const model = process.env.DASHSCOPE_MODEL || 'glm-5';

  console.log('[AI] API Key length:', apiKey?.length);
  console.log('[AI] API Key prefix:', apiKey?.substring(0, 10));

  if (!apiKey) {
    console.warn('[AI] No API key, using mock response');
    return getMockResponse(messages);
  }

  try {
    const url = `${baseUrl}/chat/completions`;

    console.log('[AI] Calling:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    console.log('[AI] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] Error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[AI] Chat error:', error);
    throw error;
  }
}

// Mock 响应
function getMockResponse(messages: ChatMessage[]): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const content = lastUserMessage?.content || '';

  if (content.includes('焦虑') || content.includes('紧张')) {
    return '我理解你的感受。焦虑是对未来不确定性的正常反应。能告诉我具体是什么让你感到不安吗？';
  }
  if (content.includes('累') || content.includes('疲惫')) {
    return '听起来你最近压力不小。记得给自己一些休息的时间。今天有什么特别耗精力的事吗？';
  }
  if (content.includes('开心') || content.includes('高兴')) {
    return '真好！能感受到你的好心情。是什么让你今天感觉不错呢？';
  }

  return '谢谢你和我分享。能再多说说你的感受吗？我在这里听你说。';
}
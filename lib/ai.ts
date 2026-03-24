// AI API 调用封装 - 使用火山方舟 API (OpenAI 兼容协议)

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Mock 响应
function getMockResponse(messages: ChatMessage[]): string {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const content = lastUserMessage?.content || '';
  return '谢谢你的信任，愿意跟我分享你的感受。能再多说说发生了什么吗？';
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.ARK_API_KEY || '';
  const baseUrl = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/coding/v3';
  const model = process.env.ARK_MODEL || 'Doubao-Seed-2.0-lite';

  if (!apiKey) {
    console.warn('[AI] No API key, using mock response');
    return getMockResponse(messages);
  }

  try {
    const url = baseUrl + '/chat/completions';

    console.log('[AI] Calling:', url);
    console.log('[AI] Model:', model);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
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
      console.error('[AI] Error response:', errorText);
      throw new Error('API error: ' + response.status + ' - ' + errorText);
    }

    const data = await response.json();
    console.log('[AI] Response data:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('[AI] Chat error:', error);
    throw error;
  }
}

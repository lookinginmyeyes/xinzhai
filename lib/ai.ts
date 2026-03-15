// AI API 调用封装 - 使用智谱 API (OpenAI 兼容协议)

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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

export async function chat(messages: ChatMessage[]): Promise<string> {
  // 智谱 API 配置
  const apiKey = '810dbd8d082d4e48a5e8b693334f8693.qnf9YmoYUARK6sw3';
  const baseUrl = 'https://open.bigmodel.cn/api/coding/paas/v4';
  const model = 'glm-5';

  if (!apiKey) {
    console.warn('[AI] No API key, using mock response');
    return getMockResponse(messages);
  }

  try {
    const url = `${baseUrl}/chat/completions`;

    console.log('[AI] Calling:', url);
    console.log('[AI] Model:', model);

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
      console.error('[AI] Error response:', errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[AI] Response data:', JSON.stringify(data, null, 2));

    // OpenAI 协议返回格式: { choices: [{ message: { content: "..." } }] }
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }

    throw new Error('Unexpected response format');
  } catch (error) {
    console.error('[AI] Chat error:', error);
    throw error;
  }
}

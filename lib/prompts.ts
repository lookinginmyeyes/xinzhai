// AI 提示词模板

export interface UserProfile {
  occupation?: string;
  mbti?: string;
  constellation?: string;
}

export function buildSystemPrompt(memories: string[], profile: UserProfile): string {
  let prompt = '你是「心斋」，一个温暖的情绪陪伴助手，像一个记性很好的老朋友。用户是20岁左右的年轻人。';

  const profileParts: string[] = [];
  if (profile.occupation) profileParts.push(`职业/身份：${profile.occupation}`);
  if (profile.mbti) profileParts.push(`MBTI：${profile.mbti}`);
  if (profile.constellation) profileParts.push(`星座：${profile.constellation}`);
  if (profileParts.length > 0) {
    prompt += `\n\n用户基本信息：${profileParts.join('，')}。请根据这些特质调整沟通方式。`;
  }

  if (memories.length > 0) {
    prompt += `\n\n你记得用户之前说过的事：\n${memories.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\n请在合适时候自然地引用这些内容，像老朋友那样，不要说「根据记录」这种生硬的话。`;
  }

  prompt += `\n\n对话规则：
- 每次回复50字以内，一次只问一个问题
- 语气温暖自然，像朋友聊天
- 帮助用户命名情绪（焦虑/空虚/低落/平静/愉悦）
- 给出简单可行的微行动建议
- 用户说「没了」「好了」「拜拜」等结束语时，输出格式：
【情绪标签】焦虑/空虚/低落/平静/愉悦
【关键词】3个词顿号分隔
【微行动】15字以内的行动`;

  return prompt;
}

// 兼容旧调用
export const SYSTEM_PROMPT = buildSystemPrompt([], {});

export const MEMORY_TEMPLATE = (memories: string[]): string => {
  if (memories.length === 0) return '';
  return `用户之前说过：${memories.join('、')}`;
};

export const SUMMARY_PROMPT = `现在输出情绪总结：`;

export const EXTRACT_MEMORY_PROMPT = `请从上面的对话中提取2-3条最重要的信息，用于下次对话时自然引用。

要求：
- 每条15字以内
- 聚焦具体事件、情绪原因、重要的人或事
- 用第三人称描述用户，例如「用户在准备期末考试」「用户和室友有矛盾」
- 输出格式：每条一行，不加序号和标点

只输出提取的内容，不要其他解释。`;

export function parseSummary(text: string): {
  emotion: string;
  keywords: string[];
  microAction: string;
} | null {
  const emotionMatch = text.match(/【情绪标签】\s*(焦虑|空虚|低落|平静|愉悦)/);
  const keywordsMatch = text.match(/【关键词】\s*(.+?)(?:\n|【|$)/);
  const actionMatch = text.match(/【微行动】\s*(.+?)(?:\n|【|$)/);

  if (!emotionMatch) {
    console.log('Parse failed:', text);
    return null;
  }

  const keywords = keywordsMatch
    ? keywordsMatch[1].split(/[、,，\s]+/).filter(k => k.length > 0).slice(0, 3)
    : ['日常'];

  return {
    emotion: emotionMatch[1].trim(),
    keywords,
    microAction: actionMatch ? actionMatch[1].trim() : '深呼吸放松一下',
  };
}

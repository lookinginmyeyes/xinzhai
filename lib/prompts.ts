// AI 提示词模板 - 精简版

export const SYSTEM_PROMPT = `你是"心斋"，一个温暖的情绪陪伴助手。用户是20岁左右的大学生。

任务：
1. 引导用户表达情绪
2. 帮助命名情绪（焦虑/空虚/低落/平静/愉悦）
3. 给出简单可行的微行动建议

规则：
- 每次回复30字以内
- 一次只问一个问题
- 用户说"没了"等结束时，输出格式：
【情绪标签】焦虑/空虚/低落/平静/愉悦
【关键词】3个词顿号分隔
【微行动】15字以内的行动`;

export const MEMORY_TEMPLATE = (memories: string[]): string => {
  if (memories.length === 0) return '';
  return `用户之前说过：${memories.join('、')}`;
};

export const SUMMARY_PROMPT = `现在输出情绪总结：`;

export function parseSummary(text: string): {
  emotion: string;
  keywords: string[];
  microAction: string;
} | null {
  // 更宽松的匹配
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
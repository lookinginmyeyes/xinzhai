// 情绪分析与处理

import { EmotionType } from '@/types';

const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  anxious: ['焦虑', '紧张', '担心', '害怕', '不安', '压力', '慌', '急'],
  empty: ['空虚', '无聊', '没意义', '不知道干嘛', '孤独', '迷茫', '没劲'],
  low: ['低落', '难过', '不开心', '郁闷', '累', '疲惫', '丧', '烦'],
  calm: ['平静', '还好', '一般', '正常', '稳定', '不错'],
  joy: ['开心', '高兴', '愉快', '幸福', '满足', '快乐', '美好'],
};

const EMOTION_LABELS: Record<EmotionType, string> = {
  anxious: '焦虑',
  empty: '空虚',
  low: '低落',
  calm: '平静',
  joy: '愉悦',
};

const EMOTION_COLORS: Record<EmotionType, string> = {
  anxious: 'var(--emotion-anxious)',
  empty: 'var(--emotion-empty)',
  low: 'var(--emotion-low)',
  calm: 'var(--emotion-calm)',
  joy: 'var(--emotion-joy)',
};

// 情绪标签文本转类型
export function emotionLabelToType(label: string): EmotionType {
  const mapping: Record<string, EmotionType> = {
    '焦虑': 'anxious',
    '空虚': 'empty',
    '低落': 'low',
    '平静': 'calm',
    '愉悦': 'joy',
  };
  return mapping[label] || 'calm';
}

// 情绪类型转标签
export function getEmotionLabel(emotion: EmotionType): string {
  return EMOTION_LABELS[emotion];
}

// 获取情绪颜色
export function getEmotionColor(emotion: EmotionType): string {
  return EMOTION_COLORS[emotion];
}

// 从文本检测情绪
export function detectEmotion(text: string): EmotionType {
  let maxScore = 0;
  let detectedEmotion: EmotionType = 'calm';

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    const score = keywords.reduce((acc, kw) => {
      return acc + (text.includes(kw) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedEmotion = emotion as EmotionType;
    }
  }

  return detectedEmotion;
}

// 提取可能的记忆内容
export function extractMemory(text: string): string | null {
  // 匹配包含"我"和一些事件关键词的句子
  const patterns = [
    /我.{0,5}(考试|面试|吵架|分手|生病|加班|论文|答辩|实习)/,
    /我.{0,3}(是|在).{2,10}(学生|工作|实习|考研)/,
    /(明天|后天|下周|周末).{2,10}/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}
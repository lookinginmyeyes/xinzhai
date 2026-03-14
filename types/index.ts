/** 情绪类型 */
export type EmotionType = 'anxious' | 'empty' | 'low' | 'calm' | 'joy';

/** 对话消息 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** 单次签到记录 */
export interface CheckIn {
  id: string;
  date: string;
  emotion: EmotionType;
  keywords: string[];
  microAction: string;
  conversation: Message[];
  createdAt: string;
}

/** 记忆条目 */
export interface Memory {
  id: string;
  content: string;
  emotion?: EmotionType;
  createdAt: string;
}

/** 用户数据 */
export interface UserData {
  checkIns: CheckIn[];
  memories: Memory[];
  lastCheckIn?: string;
}
// 本地存储封装

import { CheckIn, Memory, UserData } from '@/types';

const STORAGE_KEYS = {
  checkIns: 'xinzhai_checkins',
  memories: 'xinzhai_memories',
  lastCheckIn: 'xinzhai_last_checkin',
};

const MAX_CHECKINS = 30;
const MAX_MEMORIES = 20;

export const storage = {
  // 获取所有签到记录
  getCheckIns: (): CheckIn[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.checkIns);
      console.log('[Storage] getCheckIns:', data ? JSON.parse(data).length : 0, 'records');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 保存签到记录 (别名)
  saveCheckIn: function(checkIn: CheckIn): void {
    this.saveCheckInRecord(checkIn);
  },

  // 保存签到记录 (主要方法)
  saveCheckInRecord: (checkIn: CheckIn): void => {
    try {
      const checkIns = storage.getCheckIns();
      // 检查今天是否已有记录，有则更新
      const existingIndex = checkIns.findIndex(c => c.date === checkIn.date);
      let updated: CheckIn[];
      if (existingIndex >= 0) {
        updated = [...checkIns];
        updated[existingIndex] = checkIn;
      } else {
        updated = [checkIn, ...checkIns].slice(0, MAX_CHECKINS);
      }
      localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.lastCheckIn, checkIn.date);
      console.log('[Storage] saveCheckIn success, total:', updated.length);
    } catch (e) {
      console.error('[Storage] saveCheckIn error:', e);
    }
  },

  // 获取记忆
  getMemories: (): Memory[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.memories);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // 保存记忆
  saveMemory: (memory: Memory): void => {
    try {
      const memories = storage.getMemories();
      // 去重
      if (memories.some(m => m.content === memory.content)) {
        return;
      }
      const updated = [memory, ...memories].slice(0, MAX_MEMORIES);
      localStorage.setItem(STORAGE_KEYS.memories, JSON.stringify(updated));
      console.log('[Storage] saveMemory success, total:', updated.length);
    } catch (e) {
      console.error('[Storage] saveMemory error:', e);
    }
  },

  // 获取上次签到日期
  getLastCheckInDate: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.lastCheckIn);
  },

  // 检查今天是否已签到
  hasCheckedInToday: (): boolean => {
    const lastDate = storage.getLastCheckInDate();
    const today = new Date().toISOString().split('T')[0];
    return lastDate === today;
  },

  // 获取完整用户数据
  getUserData: (): UserData => {
    return {
      checkIns: storage.getCheckIns(),
      memories: storage.getMemories(),
      lastCheckIn: storage.getLastCheckInDate() || undefined,
    };
  },

  // 清除所有数据
  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};

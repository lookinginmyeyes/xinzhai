// 存储封装：优先 Supabase，降级 localStorage

import { CheckIn, Memory, UserData } from '@/types';
import { supabase } from '@/lib/supabase';

const STORAGE_KEYS = {
  checkIns: 'xinzhai_checkins',
  memories: 'xinzhai_memories',
  lastCheckIn: 'xinzhai_last_checkin',
  anonUserId: 'xinzhai_anon_user_id',
};

const MAX_CHECKINS = 30;
const MAX_MEMORIES = 20;

// 获取或生成匿名 user_id（OAuth 接入前的临时方案）
function getAnonUserId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(STORAGE_KEYS.anonUserId);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEYS.anonUserId, id);
  }
  return id;
}

// ── localStorage helpers ──
function localGetCheckIns(): CheckIn[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.checkIns);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function localSaveCheckIn(checkIn: CheckIn): void {
  try {
    const existing = localGetCheckIns();
    const idx = existing.findIndex(c => c.date === checkIn.date);
    const updated = idx >= 0
      ? existing.map((c, i) => i === idx ? checkIn : c)
      : [checkIn, ...existing].slice(0, MAX_CHECKINS);
    localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.lastCheckIn, checkIn.date);
  } catch (e) {
    console.error('[Storage] localSaveCheckIn error:', e);
  }
}

function localGetMemories(): Memory[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.memories);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function localSaveMemory(memory: Memory): void {
  try {
    const existing = localGetMemories();
    if (existing.some(m => m.content === memory.content)) return;
    const updated = [memory, ...existing].slice(0, MAX_MEMORIES);
    localStorage.setItem(STORAGE_KEYS.memories, JSON.stringify(updated));
  } catch (e) {
    console.error('[Storage] localSaveMemory error:', e);
  }
}

// ── Supabase helpers ──
async function remoteGetCheckIns(): Promise<CheckIn[]> {
  try {
    const userId = getAnonUserId();
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(MAX_CHECKINS);
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      date: row.date,
      emotion: row.emotion,
      keywords: row.keywords || [],
      microAction: row.micro_action || '',
      conversation: row.conversation || [],
      createdAt: row.created_at,
    }));
  } catch (e) {
    console.warn('[Storage] remoteGetCheckIns failed, falling back:', e);
    return [];
  }
}

async function remoteSaveCheckIn(checkIn: CheckIn): Promise<void> {
  try {
    const userId = getAnonUserId();
    const { error } = await supabase
      .from('check_ins')
      .upsert({
        user_id: userId,
        date: checkIn.date,
        emotion: checkIn.emotion,
        keywords: checkIn.keywords,
        micro_action: checkIn.microAction,
        conversation: checkIn.conversation,
      }, { onConflict: 'user_id,date' });
    if (error) throw error;
    console.log('[Storage] remoteSaveCheckIn success');
  } catch (e) {
    console.error('[Storage] remoteSaveCheckIn failed:', e);
    throw e;
  }
}

async function remoteGetMemories(): Promise<Memory[]> {
  try {
    const userId = getAnonUserId();
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_MEMORIES);
    if (error) throw error;
    return (data || []).map(row => ({
      id: row.id,
      content: row.content,
      emotion: row.emotion,
      createdAt: row.created_at,
    }));
  } catch (e) {
    console.warn('[Storage] remoteGetMemories failed:', e);
    return [];
  }
}

async function remoteSaveMemory(memory: Memory): Promise<void> {
  try {
    const userId = getAnonUserId();
    const { error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        content: memory.content,
        emotion: memory.emotion,
      });
    if (error) throw error;
  } catch (e) {
    console.error('[Storage] remoteSaveMemory failed:', e);
  }
}

// ── Public API ──
export const storage = {
  // 同步读（从 localStorage，供不需要等待的场景）
  getCheckIns: (): CheckIn[] => localGetCheckIns(),

  // 异步读（从 Supabase，同时同步到 localStorage）
  fetchCheckIns: async (): Promise<CheckIn[]> => {
    const remote = await remoteGetCheckIns();
    if (remote.length > 0) {
      localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(remote));
      if (remote[0]) localStorage.setItem(STORAGE_KEYS.lastCheckIn, remote[0].date);
      return remote;
    }
    return localGetCheckIns();
  },

  // 保存签到（写 Supabase + localStorage）
  saveCheckIn: async (checkIn: CheckIn): Promise<void> => {
    localSaveCheckIn(checkIn);
    await remoteSaveCheckIn(checkIn);
  },

  // 保存记忆
  saveMemory: async (memory: Memory): Promise<void> => {
    localSaveMemory(memory);
    await remoteSaveMemory(memory);
  },

  // 获取记忆（异步）
  fetchMemories: async (): Promise<Memory[]> => {
    const remote = await remoteGetMemories();
    if (remote.length > 0) return remote;
    return localGetMemories();
  },

  // 同步读记忆（localStorage）
  getMemories: (): Memory[] => localGetMemories(),

  getLastCheckInDate: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.lastCheckIn) : null,

  hasCheckedInToday: (): boolean => {
    const lastDate = storage.getLastCheckInDate();
    const today = new Date().toISOString().split('T')[0];
    return lastDate === today;
  },

  getUserData: (): UserData => ({
    checkIns: localGetCheckIns(),
    memories: localGetMemories(),
    lastCheckIn: storage.getLastCheckInDate() || undefined,
  }),

  clear: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (typeof window !== 'undefined') localStorage.removeItem(key);
    });
  },
};

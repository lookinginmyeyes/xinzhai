'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import EmotionTag from '@/components/EmotionTag';
import MicroAction from '@/components/MicroAction';
import HistoryCard from '@/components/HistoryCard';
import EmotionChart from '@/components/EmotionChart';
import { CheckIn } from '@/types';
import { storage } from '@/lib/storage';

function getAnonId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('xinzhai_anon_user_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('xinzhai_anon_user_id', id); }
  return id;
}

export default function HomePage() {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);
  const [careMessage, setCareMessage] = useState<string | null>(null);
  const [careLoading, setCareLoading] = useState(false);
  const [daysSince, setDaysSince] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const checkIns = await storage.fetchCheckIns();
      const today = new Date().toISOString().split('T')[0];

      const todayRecord = checkIns.find(c => c.date === today);
      if (todayRecord) {
        setHasCheckedInToday(true);
        setTodayCheckIn(todayRecord);
      } else {
        setHasCheckedInToday(false);
        setTodayCheckIn(null);
      }

      setRecentCheckIns(checkIns.slice(0, 5));
      setAllCheckIns(checkIns);

      // Proactive care: show if 2+ days absent and has history
      const lastDate = storage.getLastCheckInDate();
      if (lastDate && checkIns.length > 0) {
        const days = Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000);
        if (days >= 2) {
          setDaysSince(days);
          setCareLoading(true);
          try {
            const memories = await storage.fetchMemories();
            const memContents = memories.slice(0, 5).map(m => m.content);
            const lastCheckIn = checkIns[0];
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ role: 'user', content: '写关怀消息' }],
                memories: memContents,
                systemOverride: `你是心斋，一个温暖的情绪陪伴AI。用户${days}天没有签到了，上次情绪是「${lastCheckIn?.emotion || '未知'}」。根据你对用户的了解，写一句温暖自然的关怀消息，像老朋友发微信那样，引用你记得的内容，不超过30字。只输出这一句话。`,
              }),
            });
            const data = await res.json();
            if (data.content) setCareMessage(data.content);
          } catch {
            setCareMessage(`好久不见，最近怎么样？`);
          } finally {
            setCareLoading(false);
          }
        }
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Header />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-8 animate-fade-in">

        {/* AI 主动关怀卡片：超过2天未签到才出现 */}
        {(careLoading || careMessage) && (
          <section className="mb-5">
            <div
              className="relative overflow-hidden rounded-[var(--radius-lg)] p-4 border border-[var(--color-primary-light)]/40"
              style={{
                background: 'linear-gradient(135deg, rgba(184,169,154,0.15) 0%, rgba(212,200,186,0.10) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Decorative blob */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20" style={{ background: 'var(--color-primary)' }} />

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-base font-display shadow-sm">
                  心
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-primary-dark)] mb-1 font-medium">
                    {daysSince}天没见了
                  </p>
                  {careLoading ? (
                    <div className="flex gap-1 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{careMessage}</p>
                  )}
                </div>
              </div>

              <Link
                href="/chat"
                className="mt-3 flex items-center justify-center w-full py-2 rounded-full text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--color-primary)' }}
              >
                去聊聊 →
              </Link>
            </div>
          </section>
        )}

        {/* 今日状态卡片 */}
        <section className="mb-6">
          {hasCheckedInToday && todayCheckIn ? (
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 shadow-sm border border-[var(--color-border-light)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">今日情绪</p>
                  <EmotionTag emotion={todayCheckIn.emotion} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)]">已签到 ✓</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {new Date(todayCheckIn.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {todayCheckIn.microAction && (
                <MicroAction action={todayCheckIn.microAction} />
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {todayCheckIn.keywords.map((kw, i) => (
                  <span key={i} className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <Link href="/chat">
              <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-[var(--radius-lg)] p-5 shadow-md text-white cursor-pointer hover:shadow-lg transition-shadow active:scale-[0.99]">
                <p className="text-sm opacity-80 mb-1">今天还没签到</p>
                <p className="text-lg font-display">来聊聊今天的心情</p>
                <div className="mt-3 flex items-center gap-1 text-sm opacity-80">
                  <span>开始对话</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          )}
        </section>

        {/* 情绪曲线：至少1条记录就显示 */}
        {allCheckIns.length >= 1 && (
          <section className="mb-6">
            <EmotionChart checkIns={allCheckIns} />
          </section>
        )}

        {/* 最近签到记录 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-[var(--color-text-primary)]">最近记录</h2>
            <Link href="/history" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              查看全部 →
            </Link>
          </div>

          {recentCheckIns.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {recentCheckIns.map((checkIn) => (
                <HistoryCard
                  key={checkIn.id}
                  date={checkIn.date}
                  emotion={checkIn.emotion}
                  keywords={checkIn.keywords}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-[var(--color-surface)] rounded-[var(--radius-md)]">
              <p className="text-[var(--color-text-muted)]">还没有签到记录</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">开始你的第一次签到吧</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

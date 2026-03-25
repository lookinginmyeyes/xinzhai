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

export default function HomePage() {
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);

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
    };
    loadData();
  }, []);

  return (
    <>
      <Header />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full pb-8">
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
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {todayCheckIn.keywords.map((kw, i) => (
                  <span key={i} className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>

              <MicroAction action={todayCheckIn.microAction} />
            </div>
          ) : (
            <Link
              href="/chat"
              className="block bg-[var(--color-primary)] text-white rounded-[var(--radius-lg)] p-6 text-center hover:bg-[var(--color-primary-dark)] transition-colors shadow-sm"
            >
              <p className="font-display text-xl mb-2">开始今日签到</p>
              <p className="text-sm opacity-80">3分钟，和AI聊聊你的情绪</p>
            </Link>
          )}
        </section>

        {/* 情绪曲线 - 只要有记录就显示 */}
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

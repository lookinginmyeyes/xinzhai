'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import EmotionTag from '@/components/EmotionTag';
import EmotionChart from '@/components/EmotionChart';
import { CheckIn } from '@/types';
import { storage } from '@/lib/storage';

export default function HistoryPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [groupedHistory, setGroupedHistory] = useState<Record<string, CheckIn[]>>({});

  useEffect(() => {
    const allCheckIns = storage.getCheckIns();
    setCheckIns(allCheckIns);

    // 按月份分组
    const grouped = allCheckIns.reduce((acc, checkIn) => {
      const date = new Date(checkIn.date);
      const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(checkIn);
      return acc;
    }, {} as Record<string, CheckIn[]>);

    setGroupedHistory(grouped);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  return (
    <>
      <Header title="历史记录" showBack />

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {/* 情绪曲线 */}
        {checkIns.length >= 2 && (
          <section className="mb-6">
            <EmotionChart checkIns={checkIns} />
          </section>
        )}

        {/* 统计信息 */}
        {checkIns.length > 0 && (
          <section className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-2xl font-display text-[var(--color-text-primary)]">{checkIns.length}</p>
                <p className="text-xs text-[var(--color-text-muted)]">签到天数</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-2xl font-display text-[var(--color-text-primary)]">
                  {new Set(checkIns.map(c => c.date.slice(0, 7))).size}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">坚持月份</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-3 text-center">
                <p className="text-2xl font-display text-[var(--color-success)]">
                  {checkIns.filter(c => c.emotion === 'joy' || c.emotion === 'calm').length}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">好心情天数</p>
              </div>
            </div>
          </section>
        )}

        {/* 按月分组的历史记录 */}
        {Object.keys(groupedHistory).length > 0 ? (
          Object.entries(groupedHistory).map(([month, monthCheckIns]) => (
            <section key={month} className="mb-8">
              <h2 className="font-display text-lg text-[var(--color-text-primary)] mb-4">{month}</h2>
              <div className="space-y-3">
                {monthCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 shadow-sm border border-[var(--color-border-light)]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {formatDate(checkIn.date)}
                      </span>
                      <EmotionTag emotion={checkIn.emotion} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {checkIn.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] px-2 py-1 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-[var(--color-success)] shrink-0">✦</span>
                      <span className="text-[var(--color-text-primary)]">{checkIn.microAction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-muted)]">还没有签到记录</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">开始你的第一次签到吧</p>
          </div>
        )}
      </main>
    </>
  );
}
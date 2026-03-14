'use client';

import Link from 'next/link';
import { EmotionType } from '@/types';
import EmotionTag from './EmotionTag';

interface HistoryCardProps {
  date: string;
  emotion: EmotionType;
  keywords: string[];
}

export default function HistoryCard({ date, emotion, keywords }: HistoryCardProps) {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getDayName = (dateStr: string) => {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[new Date(dateStr).getDay()];
  };

  return (
    <Link
      href="/history"
      className="flex-shrink-0 w-28 bg-[var(--color-surface)] rounded-[var(--radius-md)] p-3 shadow-sm border border-[var(--color-border-light)] hover:border-[var(--color-primary-light)] transition-colors"
    >
      <p className="text-xs text-[var(--color-text-muted)]">{getDayName(date)}</p>
      <p className="text-lg font-display text-[var(--color-text-primary)] my-1">{formatDate(date)}</p>
      <EmotionTag emotion={emotion} size="sm" />
    </Link>
  );
}
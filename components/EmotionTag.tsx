'use client';

import { EmotionType } from '@/types';

interface EmotionTagProps {
  emotion: EmotionType;
  size?: 'sm' | 'md';
}

const emotionConfig: Record<EmotionType, { label: string; color: string }> = {
  anxious: { label: '焦虑', color: 'var(--emotion-anxious)' },
  empty: { label: '空虚', color: 'var(--emotion-empty)' },
  low: { label: '低落', color: 'var(--emotion-low)' },
  calm: { label: '平静', color: 'var(--emotion-calm)' },
  joy: { label: '愉悦', color: 'var(--emotion-joy)' },
};

export default function EmotionTag({ emotion, size = 'md' }: EmotionTagProps) {
  const config = emotionConfig[emotion];
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass}`}
      style={{ backgroundColor: config.color, color: 'white' }}
    >
      {config.label}
    </span>
  );
}
'use client';

import { useMemo } from 'react';
import { CheckIn, EmotionType } from '@/types';

interface EmotionChartProps {
  checkIns: CheckIn[];
}

const EMOTION_SCORES: Record<EmotionType, number> = {
  low: 1,
  empty: 2,
  anxious: 3,
  calm: 4,
  joy: 5,
};

const EMOTION_COLORS: Record<EmotionType, string> = {
  anxious: '#D4A574',
  empty: '#A8A0A0',
  low: '#9A8A7A',
  calm: '#8B9A7D',
  joy: '#C4A574',
};

const EMOTION_LABELS: Record<EmotionType, string> = {
  anxious: '焦虑',
  empty: '空虚',
  low: '低落',
  calm: '平静',
  joy: '愉悦',
};

export default function EmotionChart({ checkIns }: EmotionChartProps) {
  const chartData = useMemo(() => {
    // 取最近7条记录，按日期排序
    const recent = [...checkIns]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return recent.map((checkIn) => ({
      date: checkIn.date,
      emotion: checkIn.emotion,
      score: EMOTION_SCORES[checkIn.emotion],
      color: EMOTION_COLORS[checkIn.emotion],
      label: EMOTION_LABELS[checkIn.emotion],
    }));
  }, [checkIns]);

  if (chartData.length === 0) {
    return null;
  }

  // 单条记录显示简化版
  if (chartData.length === 1) {
    const point = chartData[0];
    return (
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 shadow-sm border border-[var(--color-border-light)]">
        <h3 className="text-sm text-[var(--color-text-secondary)] mb-3">今日情绪</h3>
        <div className="flex items-center justify-around">
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-lg font-medium"
              style={{ backgroundColor: point.color }}
            >
              {point.score}
            </div>
            <span className="text-sm text-[var(--color-text-primary)]">{point.label}</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display text-[var(--color-text-primary)]">1</p>
            <p className="text-xs text-[var(--color-text-muted)]">签到天数</p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
          继续签到查看情绪曲线
        </p>
      </div>
    );
  }

  const maxScore = 5;
  const minScore = 1;
  const chartHeight = 120;
  const chartWidth = 100;
  const pointSpacing = chartWidth / (chartData.length - 1);

  // 生成 SVG 路径
  const pathD = chartData
    .map((point, index) => {
      const x = index * pointSpacing;
      const y = chartHeight - ((point.score - minScore) / (maxScore - minScore)) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x}% ${y}`;
    })
    .join(' ');

  const areaD = `${pathD} L ${(chartData.length - 1) * pointSpacing}% ${chartHeight} L 0% ${chartHeight} Z`;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 shadow-sm border border-[var(--color-border-light)]">
      <h3 className="text-sm text-[var(--color-text-secondary)] mb-4">情绪曲线</h3>

      <div className="relative">
        {/* Y轴标签 */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-[var(--color-text-muted)]">
          <span>愉悦</span>
          <span>平静</span>
          <span>焦虑</span>
          <span>空虚</span>
          <span>低落</span>
        </div>

        {/* 图表区域 */}
        <div className="ml-14 relative" style={{ height: chartHeight }}>
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-[var(--color-border-light)]" />
            ))}
          </div>

          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={`0 0 100 ${chartHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#emotionGradient)" />
            <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          {chartData.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - ((point.score - minScore) / (maxScore - minScore)) * chartHeight;
            return (
              <div
                key={point.date}
                className="absolute w-3 h-3 rounded-full border-2 border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: y, backgroundColor: point.color }}
                title={point.label}
              />
            );
          })}
        </div>

        {/* X轴日期 */}
        <div className="ml-14 flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
          {chartData.map((point) => (
            <span key={point.date}>
              {new Date(point.date).getMonth() + 1}/{new Date(point.date).getDate()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
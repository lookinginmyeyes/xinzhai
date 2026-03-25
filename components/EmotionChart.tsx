'use client';

import { useMemo, useState } from 'react';
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

const EMOTION_EMOJI: Record<EmotionType, string> = {
  anxious: '😰',
  empty: '😶',
  low: '😔',
  calm: '😌',
  joy: '😊',
};

const EMOTION_TIPS: Record<EmotionType, string[]> = {
  anxious: ['深呼吸能缓解紧张', '试着写下担忧的事', '和信任的人聊聊天'],
  empty: ['尝试新的事物', '给朋友发个消息', '出门走走看看'],
  low: ['允许自己休息一下', '听听喜欢的音乐', '做件小事奖励自己'],
  calm: ['保持这份平静', '记录当下的感受', '享受这个时刻'],
  joy: ['分享你的快乐', '记住这份美好', '感恩这一刻'],
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function EmotionChart({ checkIns }: EmotionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const recent = [...checkIns]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return recent.map((checkIn) => ({
      date: checkIn.date,
      emotion: checkIn.emotion,
      score: EMOTION_SCORES[checkIn.emotion],
      color: EMOTION_COLORS[checkIn.emotion],
      label: EMOTION_LABELS[checkIn.emotion],
      emoji: EMOTION_EMOJI[checkIn.emotion],
      keywords: checkIn.keywords,
    }));
  }, [checkIns]);

  if (chartData.length === 0) return null;

  // Single record view
  if (chartData.length === 1) {
    const point = chartData[0];
    const tip = EMOTION_TIPS[point.emotion][0];
    return (
      <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-5 shadow-sm border border-[var(--color-border-light)]">
        <h3 className="text-sm text-[var(--color-text-secondary)] mb-4">情绪曲线</h3>
        <div className="flex items-center gap-6 mb-5">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke={point.color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(point.score / 5) * 264} 264`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl">{point.emoji}</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{point.label}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-center bg-[var(--color-surface)] rounded-lg px-4 py-2 shadow-sm">
              <p className="text-2xl font-display text-[var(--color-primary)]">1</p>
              <p className="text-xs text-[var(--color-text-muted)]">签到天数</p>
            </div>
            <div className="text-center bg-[var(--color-surface)] rounded-lg px-4 py-2 shadow-sm">
              <p className="text-2xl font-display" style={{ color: point.color }}>{point.score}/5</p>
              <p className="text-xs text-[var(--color-text-muted)]">情绪指数</p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-2 text-center">情绪量表</p>
          <div className="flex justify-between items-center gap-1">
            {(['low', 'empty', 'anxious', 'calm', 'joy'] as EmotionType[]).map((e) => (
              <div
                key={e}
                className={`flex-1 h-2 rounded-full transition-all ${e === point.emotion ? 'scale-y-150' : 'opacity-40'}`}
                style={{ backgroundColor: EMOTION_COLORS[e] }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
            {(['低落', '空虚', '焦虑', '平静', '愉悦']).map((l) => (
              <span key={l} className="flex-1 text-center">{l}</span>
            ))}
          </div>
        </div>
        <div className="bg-[var(--color-surface)] rounded-[var(--radius-sm)] p-3">
          <p className="text-xs text-[var(--color-text-muted)]">💡 小贴士</p>
          <p className="text-sm text-[var(--color-text-primary)] mt-1">{tip}</p>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">🌱 继续签到，解锁情绪曲线</p>
      </div>
    );
  }

  // Multi-record bezier curve chart
  const SVG_W = 300;
  const SVG_H = 100;
  const PAD_X = 10;
  const PAD_Y = 12;
  const innerW = SVG_W - PAD_X * 2;
  const innerH = SVG_H - PAD_Y * 2;

  const points = chartData.map((d, i) => ({
    ...d,
    px: PAD_X + (i / (chartData.length - 1)) * innerW,
    py: PAD_Y + (1 - (d.score - 1) / 4) * innerH,
  }));

  // Catmull-Rom to bezier conversion for smooth curve
  function catmullRomToBezier(pts: { px: number; py: number }[]): string {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].px} ${pts[0].py}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.px + (p2.px - p0.px) / 6;
      const cp1y = p1.py + (p2.py - p0.py) / 6;
      const cp2x = p2.px - (p3.px - p1.px) / 6;
      const cp2y = p2.py - (p3.py - p1.py) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.px} ${p2.py}`;
    }
    return d;
  }

  const linePath = catmullRomToBezier(points);
  const areaPath = `${linePath} L ${points[points.length - 1].px} ${SVG_H} L ${points[0].px} ${SVG_H} Z`;

  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-4 shadow-sm border border-[var(--color-border-light)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">情绪曲线</h3>
        <span className="text-xs text-[var(--color-text-muted)]">近 {chartData.length} 天</span>
      </div>

      {/* Tooltip */}
      {activePoint && (
        <div
          className="mb-3 px-3 py-2 rounded-[var(--radius-sm)] text-sm flex items-center gap-2 animate-bubble-in"
          style={{ backgroundColor: activePoint.color + '22', border: `1px solid ${activePoint.color}44` }}
        >
          <span className="text-base">{activePoint.emoji}</span>
          <div>
            <span className="font-medium" style={{ color: activePoint.color }}>{activePoint.label}</span>
            <span className="text-[var(--color-text-muted)] ml-2 text-xs">{formatDate(activePoint.date)}</span>
            {activePoint.keywords?.length > 0 && (
              <span className="text-[var(--color-text-muted)] ml-1 text-xs">· {activePoint.keywords.slice(0, 2).join(' ')}</span>
            )}
          </div>
        </div>
      )}

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full overflow-visible"
          style={{ height: 100 }}
        >
          <defs>
            <linearGradient id="ecGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => {
            const y = PAD_Y + (i / 4) * innerH;
            return <line key={i} x1={PAD_X} y1={y} x2={SVG_W - PAD_X} y2={y} stroke="var(--color-border-light)" strokeWidth="0.5" />;
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#ecGrad)" />

          {/* Curve line */}
          <path d={linePath} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />

          {/* Clickable data points */}
          {points.map((pt, i) => (
            <g key={pt.date} onClick={() => setActiveIndex(activeIndex === i ? null : i)} style={{ cursor: 'pointer' }}>
              {/* Hit area */}
              <circle cx={pt.px} cy={pt.py} r="12" fill="transparent" />
              {/* Outer ring when active */}
              {activeIndex === i && (
                <circle cx={pt.px} cy={pt.py} r="7" fill={pt.color} fillOpacity="0.2" stroke={pt.color} strokeWidth="1.5" />
              )}
              {/* Dot */}
              <circle
                cx={pt.px} cy={pt.py} r="4"
                fill={pt.color}
                stroke="white" strokeWidth="2"
                style={{ filter: activeIndex === i ? `drop-shadow(0 0 4px ${pt.color})` : undefined }}
              />
            </g>
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1 text-xs text-[var(--color-text-muted)] px-[10px]">
          {chartData.map((d) => (
            <span key={d.date}>{formatDate(d.date)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

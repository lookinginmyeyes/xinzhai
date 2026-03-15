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
      emoji: EMOTION_EMOJI[checkIn.emotion],
    }));
  }, [checkIns]);

  if (chartData.length === 0) {
    return null;
  }

  // 单条记录显示精美的单日可视化
  if (chartData.length === 1) {
    const point = chartData[0];
    const tip = EMOTION_TIPS[point.emotion][Math.floor(Math.random() * 3)];

    return (
      <div className="bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-elevated)] rounded-[var(--radius-lg)] p-5 shadow-sm border border-[var(--color-border-light)]">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm text-[var(--color-text-secondary)]">情绪分析</h3>
          <span className="text-xs text-[var(--color-text-muted)]">
            {new Date(point.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* 主可视化区域 */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* 情绪圆环 */}
          <div className="relative">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* 背景圆环 */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="8"
              />
              {/* 情绪圆环 - 根据分数显示进度 */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={point.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(point.score / 5) * 264} 264`}
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            {/* 中心内容 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl">{point.emoji}</span>
              <span className="text-sm font-medium text-[var(--color-text-primary)] mt-1">{point.label}</span>
            </div>
          </div>

          {/* 统计信息 */}
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

        {/* 情绪量表 */}
        <div className="mb-4">
          <p className="text-xs text-[var(--color-text-muted)] mb-2 text-center">情绪量表</p>
          <div className="flex justify-between items-center gap-1">
            {(['low', 'empty', 'anxious', 'calm', 'joy'] as EmotionType[]).map((e) => (
              <div
                key={e}
                className={`flex-1 h-2 rounded-full transition-all ${
                  e === point.emotion ? 'scale-y-150' : 'opacity-40'
                }`}
                style={{ backgroundColor: EMOTION_COLORS[e] }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {(['low', 'empty', 'anxious', 'calm', 'joy'] as EmotionType[]).map((e) => (
              <span
                key={e}
                className={`text-[10px] ${e === point.emotion ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}
              >
                {EMOTION_EMOJI[e]}
              </span>
            ))}
          </div>
        </div>

        {/* 小贴士 */}
        <div className="bg-[var(--color-surface)] rounded-lg p-3 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">💡 小贴士</p>
          <p className="text-sm text-[var(--color-text-primary)] mt-1">{tip}</p>
        </div>

        {/* 鼓励语 */}
        <p className="text-xs text-[var(--color-text-muted)] text-center mt-3">
          🌱 继续签到，解锁情绪曲线
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
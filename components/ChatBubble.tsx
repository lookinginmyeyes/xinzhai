'use client';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
  animate?: boolean;
}

export default function ChatBubble({ role, content, animate = true }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4 ${
        animate ? 'animate-bubble-in' : ''
      }`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-light)] flex items-center justify-center text-base mr-2 flex-shrink-0 mt-1">
          心
        </div>
      )}
      <div
        className={`
          max-w-[75%]
          ${
            isUser
              ? 'bg-[var(--color-primary)] text-white rounded-2xl rounded-br-md px-4 py-3 shadow-sm'
              : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-2xl rounded-bl-md px-4 py-3 shadow-md border border-[var(--color-border-light)]'
          }
        `}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

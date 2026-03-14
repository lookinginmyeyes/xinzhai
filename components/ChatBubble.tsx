'use client';

interface ChatBubbleProps {
  role: 'user' | 'ai';
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`
          max-w-[80%] px-4 py-3
          ${isUser
            ? 'bg-[var(--color-primary)] text-white rounded-[18px] rounded-br-[4px]'
            : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] rounded-[18px] rounded-bl-[4px]'
          }
        `}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
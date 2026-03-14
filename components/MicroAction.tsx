'use client';

interface MicroActionProps {
  action: string;
}

export default function MicroAction({ action }: MicroActionProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-md)] p-4 shadow-sm border border-[var(--color-border-light)]">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-success)] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4"/>
            <path d="m16.2 7.8 2.9-2.9"/>
            <path d="M18 12h4"/>
            <path d="m16.2 16.2 2.9 2.9"/>
            <path d="M12 18v4"/>
            <path d="m4.9 19.1 2.9-2.9"/>
            <path d="M2 12h4"/>
            <path d="m4.9 4.9 2.9 2.9"/>
          </svg>
        </div>
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-1">今日微行动</p>
          <p className="text-[var(--color-text-primary)] font-medium">{action}</p>
        </div>
      </div>
    </div>
  );
}
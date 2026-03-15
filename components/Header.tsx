'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

export default function Header({ title = '心斋', showBack = false, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-sm border-b border-[var(--color-border-light)]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {showBack ? (
          <Link href="/" className="flex items-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="ml-1 text-sm">返回</span>
          </Link>
        ) : (
          <div className="w-16"></div>
        )}

        <h1 className="font-display text-lg text-[var(--color-text-primary)]">
          {title}
        </h1>

        <div className="w-16 flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
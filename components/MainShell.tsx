'use client';

import { usePathname } from 'next/navigation';
import { shouldHideTabBar } from '@/lib/navigation';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = shouldHideTabBar(pathname);

  return (
    <div className={`min-h-dvh flex flex-col ${immersive ? '' : 'pb-16'}`}>
      {children}
    </div>
  );
}

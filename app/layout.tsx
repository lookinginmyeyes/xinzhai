import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import MainShell from '@/components/MainShell';
import TabBar from '@/components/TabBar';

export const metadata: Metadata = {
  title: '心斋',
  description: '每天3分钟，和AI聊聊你的情绪',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh bg-[var(--color-background)] overflow-x-hidden">
        <MainShell>{children}</MainShell>
        <TabBar />
      </body>
    </html>
  );
}

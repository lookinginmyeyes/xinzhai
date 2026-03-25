import type { Metadata } from 'next';
import '@/styles/globals.css';
import TabBar from '@/components/TabBar';

export const metadata: Metadata = {
  title: '心斋',
  description: '每天3分钟，和AI聊聊你的情绪',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[var(--color-background)]">
        <div className="min-h-screen flex flex-col pb-16">
          {children}
        </div>
        <TabBar />
      </body>
    </html>
  );
}

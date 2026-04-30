// app/layout.tsx

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DiagramBuilder',
  description: 'ソフトウェア開発やシステム構築時に必要な各種図を、AI の補佐のもと効率的に作成・管理・出力できるツール',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
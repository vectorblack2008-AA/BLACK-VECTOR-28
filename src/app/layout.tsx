import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    template: '%s | Black Vector',
    default: 'Black Vector - منصة تعليم أوامر لينكس',
  },
  description: 'منصة تعليمية متكاملة لتعلم أوامر لينكس من الصفر إلى الاحتراف. An integrated platform for learning Linux commands and terminal from scratch.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col font-mono">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

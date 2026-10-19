import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'سامانه مدیریت و گزارش‌دهی پروژه‌ها | Developer Project Tracker',
  description: 'سیستم هوشمند رصد پیشرفت پروژه‌های توسعه‌دهندگان، اسلایدر تعاملی، خروجی اکسل و معماری SSO-Ready',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070d1e] dark:text-slate-100 transition-colors selection:bg-cyan-500 selection:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

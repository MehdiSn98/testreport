'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Users,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle standard email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ورود ناموفق بود.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط.');
    } finally {
      setLoading(false);
    }
  };

  // Handle mock SSO login
  const handleSsoLogin = async (ssoId: string = 'SSO-ADM-001') => {
    setError(null);
    setSsoLoading(true);

    try {
      const res = await fetch('/api/auth/sso-mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssoId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در احراز هویت SSO');

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'خطا در اتصال به سرور SSO.');
    } finally {
      setSsoLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-slate-50 dark:bg-[#070d1e] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Theme Toggle */}
      <div className="absolute top-5 left-5 z-10">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="تغییر حالت تم"
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition hover:shadow"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      <div className="relative w-full max-w-sm z-10 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-12 h-12 rounded-2xl gradient-brand items-center justify-center shadow-lg shadow-cyan-500/20 mb-1">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
            Developer Project Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            سامانه رصد پیشرفت و گزارش‌دهی پروژه‌ها
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                پست الکترونیکی
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/20 btn-interactive flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  ورود به حساب
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#0d162d] px-2.5 text-[10px] text-slate-400">
              یا
            </span>
          </div>

          {/* SSO Quick Button */}
          <button
            type="button"
            onClick={() => handleSsoLogin('SSO-ADM-001')}
            disabled={ssoLoading}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 btn-interactive"
          >
            {ssoLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            )}
            ورود سریع با SSO سازمانی
          </button>
        </div>

        {/* Quick Demo Test Buttons */}
        <div className="rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            ورود آزمایشی با ۱ کلیک:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleSsoLogin('SSO-ADM-001')}
              className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:border-fuchsia-500 border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-800 dark:text-slate-100 text-xs btn-interactive"
            >
              👨‍💼 مدیر کل
            </button>
            <button
              type="button"
              onClick={() => handleSsoLogin('SSO-DEV-101')}
              className="py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 hover:border-cyan-500 border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-800 dark:text-slate-100 text-xs btn-interactive"
            >
              👩‍💻 سارا (توسعه‌دهنده)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

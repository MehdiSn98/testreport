'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FolderKanban,
  FileSpreadsheet,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  LogOut,
} from 'lucide-react';
import { User } from '@/types';

interface DashboardHeaderProps {
  isAdmin: boolean;
  theme: string;
  users: User[];
  todayShamsi: string;
  downloadingExcel: boolean;
  onToggleTheme: () => void;
  onQuickSwitchUser: (ssoId: string) => void;
  onDownloadExcel: (userId?: string, userName?: string) => void;
  onOpenNewProjectModal: () => void;
  onLogout: () => void;
}

export function DashboardHeader({
  isAdmin,
  theme,
  users,
  todayShamsi,
  downloadingExcel,
  onToggleTheme,
  onQuickSwitchUser,
  onDownloadExcel,
  onOpenNewProjectModal,
  onLogout,
}: DashboardHeaderProps) {
  const [isExcelMenuOpen, setIsExcelMenuOpen] = useState(false);
  const excelMenuRef = useRef<HTMLDivElement>(null);

  // Close Excel dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (excelMenuRef.current && !excelMenuRef.current.contains(event.target as Node)) {
        setIsExcelMenuOpen(false);
      }
    }
    if (isExcelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExcelMenuOpen]);

  const handleExcelItemClick = (userId?: string, userName?: string) => {
    setIsExcelMenuOpen(false);
    onDownloadExcel(userId, userName);
  };

  return (
    <>
      {/* Top Header sticky on scroll */}
      <header className="sticky top-0 z-40 bg-slate-50/95 dark:bg-[#0c1017]/95 backdrop-blur-md py-3.5 border-b border-slate-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              پروژه‌های توسعه نرم‌افزار
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              تیم توسعه نرم‌افزار پالایشگاه آبادان
            </p>
          </div>
        </div>

        {/* Quick Actions (Role pill, Theme toggle, Excel download, Add project) */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Quick user toggle pill */}
          <button
            type="button"
            onClick={() => onQuickSwitchUser(isAdmin ? 'SSO-DEV-101' : 'SSO-ADM-001')}
            className="text-xs px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 font-medium btn-interactive"
            title="تغییر سریع بین مدیر و توسعه‌دهنده"
          >
            {isAdmin ? 'مدیر (فقط‌خواندنی)' : 'سارا (توسعه‌دهنده)'}
          </button>

          {/* Excel Download button (Admin Only) */}
          {isAdmin && (
            <div className="relative" ref={excelMenuRef}>
              <button
                type="button"
                onClick={() => setIsExcelMenuOpen(!isExcelMenuOpen)}
                disabled={downloadingExcel}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-cyan-600 btn-interactive text-xs font-semibold shadow-sm"
                title="دانلود گزارش اکسل"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">خروجی اکسل</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isExcelMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExcelMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-56 rounded-2xl p-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 shadow-xl z-50 text-xs animate-dropdown-pop space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    نوع گزارش اکسل
                  </div>
                  {/* Overall export */}
                  <button
                    type="button"
                    onClick={() => handleExcelItemClick()}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-right hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 font-medium transition"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>گزارش جامع (کل سازمان)</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <div className="px-2 py-0.5 text-[10px] font-bold text-slate-500">
                    تفکیک به ازای هر کاربر:
                  </div>

                  {/* Developer-specific exports */}
                  {users
                    .filter((u) => u.role === 'DEVELOPER')
                    .map((dev) => (
                      <button
                        key={dev.id}
                        type="button"
                        onClick={() => handleExcelItemClick(dev.id, dev.name)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-right hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition"
                      >
                        <span className="truncate">{dev.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {dev.department ? 'توسعه' : ''}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggle button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:text-amber-500 btn-interactive"
            title="تغییر تم (دارک / لایت)"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </button>

          {/* Add Project button (Developers Only) */}
          {!isAdmin && (
            <button
              type="button"
              onClick={onOpenNewProjectModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white font-bold text-xs shadow-sm btn-interactive"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>پروژه جدید</span>
            </button>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 btn-interactive"
            title="خروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Date Banner below sticky header */}
      <div className="flex items-center text-xs mt-3 pt-1">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400">
          <span>تاریخ گزارش:</span>
          <span className="font-mono font-bold text-slate-900 dark:text-white">
            {todayShamsi}
          </span>
        </div>
      </div>
    </>
  );
}

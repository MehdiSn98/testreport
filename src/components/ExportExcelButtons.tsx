'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { User } from '@/types';

interface ExportExcelButtonsProps {
  users: User[];
  selectedUserId?: string;
}

export function ExportExcelButtons({ users, selectedUserId }: ExportExcelButtonsProps) {
  const [downloadingOverall, setDownloadingOverall] = useState(false);
  const [downloadingUser, setDownloadingUser] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string>(selectedUserId || '');

  const developers = users.filter((u) => u.role === 'DEVELOPER');

  // Download overall company Excel report
  const handleDownloadOverall = async () => {
    try {
      setDownloadingOverall(true);
      const res = await fetch('/api/export/excel');
      if (!res.ok) throw new Error('Failed to generate report');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Projects_Report_Overall_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('خطا در تولید فایل اکسل گزارش کلی.');
    } finally {
      setDownloadingOverall(false);
    }
  };

  // Download developer-specific Excel report
  const handleDownloadUserSpecific = async (userIdToDownload: string) => {
    if (!userIdToDownload) {
      alert('لطفاً ابتدا یک توسعه‌دهنده را انتخاب کنید.');
      return;
    }

    try {
      setDownloadingUser(true);
      const res = await fetch(`/api/export/excel?userId=${encodeURIComponent(userIdToDownload)}`);
      if (!res.ok) throw new Error('Failed to download report');

      const dev = developers.find((d) => d.id === userIdToDownload);
      const devName = dev ? dev.name.replace(/[\s\(\)]+/g, '_') : 'Developer';

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Projects_Report_${devName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert('خطا در دانلود فایل اکسل توسعه‌دهنده.');
    } finally {
      setDownloadingUser(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Overall company Excel export button */}
      <button
        type="button"
        onClick={handleDownloadOverall}
        disabled={downloadingOverall}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-sm transition disabled:opacity-50"
      >
        {downloadingOverall ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-4 h-4" />
        )}
        خروجی اکسل (کل شرکت)
      </button>

      {/* Developer-specific export selector & button */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0e172e] border border-slate-200 dark:border-slate-700/80">
        <select
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          aria-label="انتخاب توسعه‌دهنده برای خروجی اکسل"
          className="bg-transparent text-xs text-slate-800 dark:text-slate-200 px-2 py-1 outline-none cursor-pointer"
        >
          <option value="" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
            انتخاب توسعه‌دهنده...
          </option>
          {developers.map((dev) => (
            <option key={dev.id} value={dev.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
              {dev.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => handleDownloadUserSpecific(targetUserId)}
          disabled={!targetUserId || downloadingUser}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-medium text-xs shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {downloadingUser ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          دانلود اکسل کاربر
        </button>
      </div>
    </div>
  );
}

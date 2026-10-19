'use client';

import React from 'react';
import { Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

interface DashboardMetricsProps {
  inProgressCount: number;
  completedCount: number;
  plannedCount: number;
}

export function DashboardMetrics({
  inProgressCount,
  completedCount,
  plannedCount,
}: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      {/* Card 1: In progress */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
        <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mb-1" />
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {toPersianDigits(inProgressCount)}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
          در حال اجرا
        </span>
      </div>

      {/* Card 2: Completed */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1" />
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {toPersianDigits(completedCount)}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
          تحویل شده
        </span>
      </div>

      {/* Card 3: Planned / Future */}
      <div className="rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
        <CalendarDays className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400 mb-1" />
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {toPersianDigits(plannedCount)}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
          پروژه آتی
        </span>
      </div>
    </div>
  );
}

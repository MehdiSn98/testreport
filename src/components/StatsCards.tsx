'use client';

import React from 'react';
import { Layers, Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import { DashboardStats } from '@/types';
import { toPersianDigits } from '@/lib/date-utils';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'کل پروژه‌ها',
      value: toPersianDigits(stats.totalProjects),
      icon: Layers,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
      badge: `${toPersianDigits(stats.averageProgress)}٪ میانگین پیشرفت`,
    },
    {
      title: 'در حال انجام',
      value: toPersianDigits(stats.inProgressProjects),
      icon: Clock,
      color: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/40',
      badge: 'فعال با اسلایدر',
    },
    {
      title: 'پروژه‌های آینده',
      value: toPersianDigits(stats.plannedProjects || 0),
      icon: CalendarDays,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40',
      badge: 'برنامه‌ریزی‌شده',
    },
    {
      title: 'تکمیل شده',
      value: toPersianDigits(stats.completedProjects),
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
      badge: 'تحویل نهایی',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="rounded-2xl p-4 bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800 shadow-sm transition hover:shadow-md flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {c.title}
              </span>
              <div className={`p-2 rounded-xl border ${c.bgColor}`}>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-black ${c.color}`}>
                {c.value}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {c.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

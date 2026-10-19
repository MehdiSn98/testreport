'use client';

import React from 'react';

export type FilterTabType = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';

interface DashboardFilterTabsProps {
  activeTab: FilterTabType;
  onTabChange: (tab: FilterTabType) => void;
}

export function DashboardFilterTabs({
  activeTab,
  onTabChange,
}: DashboardFilterTabsProps) {
  const tabs: { key: FilterTabType; label: string; activeClass: string }[] = [
    {
      key: 'ALL',
      label: 'همه',
      activeClass: 'bg-slate-800 text-white dark:bg-slate-700',
    },
    {
      key: 'IN_PROGRESS',
      label: 'در حال اجرا',
      activeClass: 'bg-cyan-600 text-white',
    },
    {
      key: 'COMPLETED',
      label: 'تحویل‌شده',
      activeClass: 'bg-emerald-600 text-white',
    },
    {
      key: 'PLANNED',
      label: 'پروژه آتی',
      activeClass: 'bg-fuchsia-600 text-white',
    },
  ];

  return (
    <div className="flex items-center justify-between text-xs pt-1">
      <span className="text-slate-600 dark:text-slate-400 font-medium">
        نمایش پروژه‌ها:
      </span>
      <div className="flex items-center gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold btn-interactive ${
              activeTab === tab.key
                ? tab.activeClass
                : 'bg-white dark:bg-[#151c28] text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { toPersianDigits } from '@/lib/date-utils';
import { PaginationControls } from './PaginationControls';

interface PlannedSectionProps {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function PlannedSection({
  projects,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: PlannedSectionProps) {
  return (
    <section className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            پروژه‌های آتی
          </h2>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            پروژه‌های برنامه‌ریزی‌شده برای آینده
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-500/20 font-medium">
          {toPersianDigits(totalCount)} پروژه
        </span>
      </div>

      <div className="space-y-2.5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm flex items-center justify-between transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md animate-fade-in-soft"
          >
            {/* Right: Title & status */}
            <div className="text-right">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">در انتظار شروع</p>
            </div>

            {/* Left: Action buttons (Edit & Delete) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(p)}
                className="p-1 rounded text-slate-500 hover:text-cyan-600 btn-interactive"
                title="ویرایش"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-500 btn-interactive"
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

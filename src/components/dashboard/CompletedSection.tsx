'use client';

import React from 'react';
import { Check, Edit, Trash2 } from 'lucide-react';
import { Project } from '@/types';
import { formatJalaliNumeric, toPersianDigits } from '@/lib/date-utils';
import { PaginationControls } from './PaginationControls';

interface CompletedSectionProps {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function CompletedSection({
  projects,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: CompletedSectionProps) {
  return (
    <section className="space-y-3 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            پروژه‌های تکمیل‌شده و تحویل‌شده
          </h2>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            بر اساس تاریخ واقعی تحویل
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
          {toPersianDigits(totalCount)} پروژه
        </span>
      </div>

      <div className="space-y-2.5">
        {projects.map((p) => {
          const deliveryDate = p.deliveredDate || p.endDate;
          return (
            <div
              key={p.id}
              className="rounded-2xl p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2.5 transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md animate-fade-in-soft"
            >
              {/* Header Row: Title on the right, Status badge and Action buttons on the left */}
              <div className="flex items-center justify-between gap-3">
                {/* Right: Title & Delivery Status */}
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                </div>

                {/* Left: Status badge, Edit and Delete buttons */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    تحویل‌شده
                  </span>
                  <div className="flex items-center gap-1.5 border-s border-slate-200 dark:border-slate-800 ps-2">
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
              </div>

              {/* Progress Bar turns GREEN when completed! */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 w-full" />
              </div>

              {/* Bottom Row: Delivery date on the right */}
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                <span>تاریخ تحویل: {formatJalaliNumeric(deliveryDate)}</span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  ۱۰۰٪ تکمیل
                </span>
              </div>
            </div>
          );
        })}
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

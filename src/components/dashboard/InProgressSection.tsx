'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Project, AuthSession } from '@/types';
import { formatJalaliNumeric, getDaysRemaining, toPersianDigits } from '@/lib/date-utils';
import { ProgressSlider } from '@/components/ProgressSlider';
import { PaginationControls } from './PaginationControls';

interface InProgressSectionProps {
  projects: Project[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentUser: AuthSession['user'] | null;
  isAdmin: boolean;
  onPageChange: (page: number) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onProgressUpdated: () => void;
}

export function InProgressSection({
  projects,
  totalCount,
  currentPage,
  totalPages,
  currentUser,
  isAdmin,
  onPageChange,
  onEdit,
  onDelete,
  onProgressUpdated,
}: InProgressSectionProps) {
  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            پروژه‌های در حال اجرا
          </h2>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            درصد پیشرفت و پیش‌بینی پایان
          </p>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-medium">
          {toPersianDigits(totalCount)} پروژه
        </span>
      </div>

      <div className="space-y-3">
        {projects.map((p) => {
          const deadline = getDaysRemaining(p.endDate);
          const canEdit = !isAdmin && p.users?.some((u) => u.id === currentUser?.id);

          return (
            <div
              key={p.id}
              className="rounded-2xl p-4 bg-white dark:bg-[#151c28] border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-3 transition hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md animate-fade-in-soft"
            >
              {/* Project Title (Right) and Developer Name (Left) */}
              <div className="flex items-center justify-between">
                {/* Right: Project Title */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h3>

                {/* Left: Developer Name */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {p.users?.[0]?.name ? `${p.users[0].name}` : 'توسعه‌دهنده'}
                  </span>
                </div>
              </div>

              {/* Progress Slider (Interactive for assigned developer, read-only for admin) */}
              <ProgressSlider
                projectId={p.id}
                initialProgress={p.progress}
                disabled={!canEdit}
                onUpdate={onProgressUpdated}
              />

              {/* Estimated completion date */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">پیش‌بینی اتمام:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {formatJalaliNumeric(p.endDate)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {deadline.isOverdue
                    ? `⚠️ ${toPersianDigits(deadline.days)} روز تاخیر`
                    : `${toPersianDigits(deadline.days)} روز باقیمانده`}
                </span>
              </div>

              {/* Action buttons (Edit & Delete - strictly on the bottom left) */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3 mr-auto">
                  <button
                    type="button"
                    onClick={() => onEdit(p)}
                    className="text-xs text-slate-600 hover:text-cyan-600 flex items-center gap-1 btn-interactive"
                    title="ویرایش"
                  >
                    <Edit className="w-3 h-3" /> ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className="text-xs text-slate-500 hover:text-rose-500 flex items-center gap-1 btn-interactive"
                    title="حذف"
                  >
                    <Trash2 className="w-3 h-3" /> حذف
                  </button>
                </div>
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

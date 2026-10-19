'use client';

import React from 'react';
import { Calendar, Clock, AlertTriangle, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { Project } from '@/types';
import { formatJalaliNumeric, getDaysRemaining, toPersianDigits } from '@/lib/date-utils';
import { ProgressSlider } from './ProgressSlider';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onProgressChange?: (newProgress: number) => void;
  isOwnerOrAdmin?: boolean;
  canEditProgress?: boolean;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onProgressChange,
  isOwnerOrAdmin = true,
  canEditProgress = false,
}: ProjectCardProps) {
  const deadlineInfo = getDaysRemaining(project.endDate);
  const isCompleted = project.status === 'COMPLETED' || project.progress === 100;
  const isPlanned = project.status === 'PLANNED' && project.progress === 0;
  const isOverdue = deadlineInfo.isOverdue && !isCompleted && !isPlanned;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
      {/* Top banner accent stripe */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          isCompleted
            ? 'from-emerald-500 to-teal-400'
            : isPlanned
            ? 'from-indigo-500 via-purple-500 to-pink-500'
            : isOverdue
            ? 'from-rose-500 to-amber-500'
            : 'from-cyan-500 via-sky-400 to-fuchsia-500'
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Header: Title and Status Badge */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
              {project.title}
            </h4>

            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                  : isPlanned
                  ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                  : 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  تکمیل شده
                </>
              ) : isPlanned ? (
                <>
                  <Calendar className="w-3 h-3" />
                  پروژه‌های آینده
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  در حال انجام
                </>
              )}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description || 'توضیحات تکمیلی برای این پروژه ثبت نشده است.'}
          </p>

          {/* Assigned Developer */}
          {project.user && (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">
                {project.user.avatar || '👤'}
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {project.user.name}
              </span>
              <span>({project.user.department || 'واحد توسعه'})</span>
            </div>
          )}
        </div>

        {/* Dates in Shamsi numeric format: YYYY/MM/DD */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px]">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">تاریخ شروع:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {formatJalaliNumeric(project.startDate)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block mb-0.5">موعد تحویل:</span>
            <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
              {formatJalaliNumeric(project.endDate)}
            </span>
          </div>
        </div>

        {/* Overdue alert if deadline passed */}
        {isOverdue && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-2.5 py-1.5 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>پروژه {toPersianDigits(deadlineInfo.days)} روز تاخیر دارد.</span>
          </div>
        )}

        {/* Interactive Progress Slider (Editable only by developer owner) */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <ProgressSlider
            projectId={project.id}
            initialProgress={project.progress}
            disabled={!canEditProgress}
            onUpdate={onProgressChange}
          />
        </div>

        {/* Card actions (Edit & Delete) */}
        {isOwnerOrAdmin && (
          <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <Edit3 className="w-3 h-3" />
                ویرایش
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(project.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 rounded-lg transition"
              >
                <Trash2 className="w-3 h-3" />
                حذف
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  ArrowUpDown,
  Calendar,
} from 'lucide-react';
import { Project, User } from '@/types';
import { formatJalaliNumeric, getDaysRemaining, toPersianDigits } from '@/lib/date-utils';
import { ProgressSlider } from './ProgressSlider';

interface AdminProjectTableProps {
  projects: Project[];
  users: User[];
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onProjectUpdated: () => void;
}

export function AdminProjectTable({
  projects,
  users,
  onEditProject,
  onDeleteProject,
  onProjectUpdated,
}: AdminProjectTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevId, setSelectedDevId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'progress' | 'endDate' | 'title'>('endDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const developers = users.filter((u) => u.role === 'DEVELOPER');

  // Filter projects by search query, developer, and status
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = p.title.toLowerCase().includes(q);
          const matchesDesc = p.description?.toLowerCase().includes(q) || false;
          const matchesUser = p.user?.name.toLowerCase().includes(q) || false;
          if (!matchesTitle && !matchesDesc && !matchesUser) return false;
        }

        if (selectedDevId !== 'ALL' && p.userId !== selectedDevId) {
          return false;
        }

        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'progress') {
          diff = a.progress - b.progress;
        } else if (sortField === 'endDate') {
          diff = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        } else if (sortField === 'title') {
          diff = a.title.localeCompare(b.title);
        }
        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [projects, searchQuery, selectedDevId, selectedStatus, sortField, sortDirection]);

  const toggleSort = (field: 'progress' | 'endDate' | 'title') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Search and Filters Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در عنوان، شرح یا نام توسعه‌دهنده..."
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
          />
        </div>

        {/* Developer and Status filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <select
            value={selectedDevId}
            onChange={(e) => setSelectedDevId(e.target.value)}
            aria-label="فیلتر بر اساس توسعه‌دهنده"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="ALL">همه توسعه‌دهندگان ({developers.length})</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="فیلتر بر اساس وضعیت"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="PLANNED">پروژه‌های آینده</option>
            <option value="IN_PROGRESS">در حال انجام</option>
            <option value="COMPLETED">تکمیل شده</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1124] text-slate-600 dark:text-slate-300 font-semibold">
                <th className="py-3 px-4">توسعه‌دهنده</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                  onClick={() => toggleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    عنوان پروژه
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">وضعیت</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition min-w-[220px]"
                  onClick={() => toggleSort('progress')}
                >
                  <div className="flex items-center gap-1">
                    درصد پیشرفت
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                  onClick={() => toggleSort('endDate')}
                >
                  <div className="flex items-center gap-1">
                    موعد (شمسی)
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    موردی مطابق با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((p) => {
                  const deadlineInfo = getDaysRemaining(p.endDate);
                  const isCompleted = p.status === 'COMPLETED' || p.progress === 100;
                  const isPlanned = p.status === 'PLANNED';
                  const isOverdue = deadlineInfo.isOverdue && !isCompleted && !isPlanned;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Developer Info */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">
                            {p.user?.avatar || '👤'}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {p.user?.name || 'نامشخص'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.user?.department || 'توسعه'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Project Title & Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {p.title}
                        </div>
                        {p.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {p.description}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                      </td>

                      {/* Progress Slider (Read-only for Admin) */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <ProgressSlider
                          projectId={p.id}
                          initialProgress={p.progress}
                          disabled={true}
                          onUpdate={onProjectUpdated}
                        />
                      </td>

                      {/* Shamsi Dates and Deadline status: YYYY/MM/DD */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {formatJalaliNumeric(p.endDate)}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {isCompleted ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">پایان یافته</span>
                          ) : isPlanned ? (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">شروع در آینده</span>
                          ) : isOverdue ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {toPersianDigits(deadlineInfo.days)} روز تاخیر
                            </span>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              {toPersianDigits(deadlineInfo.days)} روز باقیمانده
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditProject(p)}
                            title="ویرایش پروژه"
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProject(p.id)}
                            title="حذف پروژه"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0a1124] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>نمایش {toPersianDigits(filteredProjects.length)} از {toPersianDigits(projects.length)} پروژه</span>
          <span className="font-mono text-cyan-700 dark:text-cyan-400">فرمت تاریخ: شمسی (YYYY/MM/DD)</span>
        </div>
      </div>
    </div>
  );
}

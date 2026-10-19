'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Project, User as UserType, ProjectStatus } from '@/types';
import { getTodayGregorian, toPersianDigits } from '@/lib/date-utils';
import { ShamsiDatePicker } from './ShamsiDatePicker';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (project: Project) => void;
  projectToEdit?: Project | null;
  users: UserType[];
  currentUserId: string;
  isAdmin: boolean;
}

export function ProjectFormModal({
  isOpen,
  onClose,
  onSaved,
  projectToEdit,
  users,
  currentUserId,
  isAdmin,
}: ProjectFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetUserId, setTargetUserId] = useState(currentUserId);
  const [status, setStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState(getTodayGregorian());
  const [endDate, setEndDate] = useState(getTodayGregorian());
  const [deliveredDate, setDeliveredDate] = useState(getTodayGregorian());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const developers = users.filter((u) => u.role === 'DEVELOPER');

  useEffect(() => {
    if (projectToEdit) {
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description || '');
      setTargetUserId(projectToEdit.userId || currentUserId);
      setStatus(projectToEdit.status);
      setProgress(projectToEdit.progress);
      setStartDate(projectToEdit.startDate);
      setEndDate(projectToEdit.endDate);
      setDeliveredDate(projectToEdit.deliveredDate || getTodayGregorian());
    } else {
      setTitle('');
      setDescription('');
      setTargetUserId(currentUserId);
      setStatus('IN_PROGRESS');
      setProgress(0);
      setStartDate(getTodayGregorian());
      setEndDate(getTodayGregorian());
      setDeliveredDate(getTodayGregorian());
    }
    setError(null);
  }, [projectToEdit, currentUserId, isOpen]);

  if (!isOpen) return null;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('عنوان پروژه الزامی است.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
      return;
    }

    try {
      setLoading(true);

      const endpoint = projectToEdit ? `/api/projects/${projectToEdit.id}` : '/api/projects';
      const method = projectToEdit ? 'PUT' : 'POST';

      const payload = {
        title: title.trim(),
        description: description.trim(),
        status: progress === 100 ? 'COMPLETED' : status,
        progress: Number(progress),
        startDate,
        endDate,
        deliveredDate: (progress === 100 || status === 'COMPLETED') ? (deliveredDate || endDate) : null,
        targetUserId: isAdmin ? targetUserId : currentUserId,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'خطایی رخ داده است');
      }

      onSaved(data.project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت اطلاعات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200">
      <div className="relative w-full max-w-xl min-h-[500px] rounded-2xl bg-white dark:bg-[#0d162d] border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-800 dark:text-slate-100 animate-modal-pop">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0a1124] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {projectToEdit ? 'ویرایش پروژه' : 'ثبت پروژه جدید'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                مشخصات و بازه زمانی شمسی پروژه
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition btn-interactive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              عنوان پروژه <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بازطراحی پنل کاربری"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition"
            />
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              توضیحات مختصر
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح کوتاه تسک‌ها یا نیازمندی‌ها..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition resize-none"
            />
          </div>

          {/* Shamsi Datepickers for Start, Estimated End dates, and Delivery Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ShamsiDatePicker
              label="تاریخ شروع (شمسی)"
              required
              value={startDate}
              onChange={(gDate) => setStartDate(gDate)}
            />
            <ShamsiDatePicker
              label="پیش‌بینی اتمام (شمسی)"
              required
              value={endDate}
              onChange={(gDate) => setEndDate(gDate)}
            />
          </div>

          {(status === 'COMPLETED' || progress === 100) && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <ShamsiDatePicker
                label="تاریخ واقعی تحویل (شمسی)"
                required
                value={deliveredDate}
                onChange={(gDate) => setDeliveredDate(gDate)}
              />
            </div>
          )}

          {/* Status Selection and Progress Slider */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">وضعیت:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('PLANNED');
                    setProgress(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    status === 'PLANNED'
                      ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  پروژه‌های آینده
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('IN_PROGRESS');
                    if (progress === 100) setProgress(50);
                    else if (progress === 0) setProgress(25);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    status === 'IN_PROGRESS' && progress < 100
                      ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  در حال انجام
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus('COMPLETED');
                    setProgress(100);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    status === 'COMPLETED' || progress === 100
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  تکمیل شده
                </button>
              </div>
            </div>

            {/* Slider (Locked for Admin) with colored track background */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium">
                <span>درصد پیشرفت:</span>
                <span className="font-bold text-slate-900 dark:text-white">{toPersianDigits(progress)}٪</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                disabled={isAdmin}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setProgress(val);
                  if (val === 100) setStatus('COMPLETED');
                  else if (status === 'COMPLETED') setStatus('IN_PROGRESS');
                }}
                style={{
                  background:
                    progress === 100
                      ? 'linear-gradient(to left, #10b981 0%, #22c55e 100%)'
                      : `linear-gradient(to left, #d946ef 0%, #06b6d4 ${progress}%, rgba(148, 163, 184, 0.2) ${progress}%, rgba(148, 163, 184, 0.2) 100%)`,
                }}
                className={`custom-slider ${isAdmin ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
              />
              {isAdmin && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  🔒 درصد پیشرفت پروژه منحصراً توسط توسعه‌دهنده مسئول تغییر می‌یابد.
                </p>
              )}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium btn-interactive"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 hover:from-cyan-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 btn-interactive disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : projectToEdit ? 'ذخیره تغییرات' : 'ایجاد پروژه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

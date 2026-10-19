'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Clock, Sparkles, Lock } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

interface ProgressSliderProps {
  projectId: string;
  initialProgress: number;
  disabled?: boolean;
  onUpdate?: (newProgress: number) => void;
}

export function ProgressSlider({
  projectId,
  initialProgress,
  disabled = false,
  onUpdate,
}: ProgressSliderProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  const saveToServer = async (val: number) => {
    try {
      setSavingStatus('saving');
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: val }),
      });

      if (!res.ok) throw new Error('خطا در ذخیره');

      setSavingStatus('saved');
      if (onUpdate) onUpdate(val);

      setTimeout(() => {
        setSavingStatus('idle');
      }, 1500);
    } catch {
      setSavingStatus('error');
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setProgress(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveToServer(val);
    }, 350);
  };

  const handleQuickPreset = (val: number) => {
    if (disabled) return;
    setProgress(val);
    saveToServer(val);
  };

  // When completed (100%), bar turns green as requested; otherwise brand gradient is used
  const trackBackground =
    progress === 100
      ? 'linear-gradient(to left, #10b981 0%, #22c55e 100%)'
      : `linear-gradient(to left, #d946ef 0%, #06b6d4 ${progress}%, rgba(148, 163, 184, 0.2) ${progress}%, rgba(148, 163, 184, 0.2) 100%)`;

  return (
    <div className="w-full space-y-3">
      {/* Top row: Label, Percentage badge, Saving feedback */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">درصد پیشرفت:</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-xs transition-all duration-200 ${
              progress === 100
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/60'
                : progress >= 60
                ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800/60'
                : 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 dark:border-fuchsia-800/60'
            }`}
          >
            {progress === 100 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : progress >= 60 ? (
              <Clock className="w-3.5 h-3.5 text-cyan-700 dark:text-cyan-400 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-fuchsia-700 dark:text-fuchsia-400 shrink-0" />
            )}
            <span>{toPersianDigits(progress)}٪</span>
          </span>
        </div>

        {/* Live sync status badge */}
        <div>
          {savingStatus === 'saving' && (
            <span className="text-xs text-cyan-600 dark:text-cyan-400 animate-pulse flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-ping" />
              در حال ذخیره...
            </span>
          )}
          {savingStatus === 'saved' && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">✓ ذخیره شد</span>
          )}
          {savingStatus === 'error' && (
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">خطا در ذخیره‌سازی</span>
          )}
        </div>
      </div>

      {/* Interactive Range Input / Read-only Bar */}
      <div className="relative flex items-center py-1">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={progress}
          disabled={disabled}
          onChange={handleSliderChange}
          style={{ background: trackBackground }}
          className={`custom-slider ${disabled ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
          aria-label="اسلایدر درصد پیشرفت"
        />
      </div>

      {/* Disabled note for Admin or unauthorized view */}
      {disabled ? (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
          <span>تغییر پیشرفت تنها در اختیار توسعه‌دهنده مسئول پروژه است.</span>
        </div>
      ) : (
        /* Quick Preset Buttons (0%, 25%, 50%, 75%, 100%) with high contrast in light & dark modes */
        <div className="flex items-center justify-between gap-1.5 pt-1">
          {[0, 25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleQuickPreset(preset)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all duration-150 font-medium ${
                progress === preset
                  ? 'bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60'
              }`}
            >
              {toPersianDigits(preset)}٪
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

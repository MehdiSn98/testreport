'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  const safeTotal = Math.max(1, totalPages);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);

  return (
    <div className="flex items-center justify-between pt-2 px-1 text-xs">
      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
        صفحه {toPersianDigits(safeCurrent)} از {toPersianDigits(safeTotal)}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={safeCurrent <= 1}
          onClick={() => onPageChange(Math.max(1, safeCurrent - 1))}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed btn-interactive"
          title="صفحه قبل"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={safeCurrent >= safeTotal}
          onClick={() => onPageChange(Math.min(safeTotal, safeCurrent + 1))}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed btn-interactive"
          title="صفحه بعد"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

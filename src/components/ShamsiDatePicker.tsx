'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import {
  gregorianToJalali,
  jalaliToGregorian,
  formatJalaliNumeric,
  JALALI_MONTH_NAMES,
  getTodayGregorian,
  toPersianDigits,
} from '@/lib/date-utils';

interface ShamsiDatePickerProps {
  value: string; // Gregorian ISO date (YYYY-MM-DD)
  onChange: (gregorianDate: string) => void;
  label?: string;
  required?: boolean;
}

export function ShamsiDatePicker({
  value,
  onChange,
  label,
  required = false,
}: ShamsiDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value to Jalali
  const getInitialJalali = () => {
    const raw = value || getTodayGregorian();
    const [gy, gm, gd] = raw.split('-').map(Number);
    const [jy, jm, jd] = gregorianToJalali(gy, gm, gd);
    return { year: jy, month: jm, day: jd };
  };

  const initial = getInitialJalali();
  const [currentYear, setCurrentYear] = useState(initial.year);
  const [currentMonth, setCurrentMonth] = useState(initial.month);

  useEffect(() => {
    const init = getInitialJalali();
    setCurrentYear(init.year);
    setCurrentMonth(init.month);
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate number of days in the selected Jalali month
  const getDaysInMonth = (year: number, month: number) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Leap year calculation for month 12 (Esfand)
    const isLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(year % 33);
    return isLeap ? 30 : 29;
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

  // Current selected day in Jalali
  const selectedJalali = getInitialJalali();
  const isSelected = (day: number) =>
    selectedJalali.year === currentYear &&
    selectedJalali.month === currentMonth &&
    selectedJalali.day === day;

  // Handle day selection
  const handleSelectDay = (day: number) => {
    const [gy, gm, gd] = jalaliToGregorian(currentYear, currentMonth, day);
    const gDate = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
    onChange(gDate);
    setIsOpen(false);
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Jump to today
  const handleToday = () => {
    const todayG = getTodayGregorian();
    onChange(todayG);
    const [gy, gm, gd] = todayG.split('-').map(Number);
    const [jy, jm] = gregorianToJalali(gy, gm, gd);
    setCurrentYear(jy);
    setCurrentMonth(jm);
    setIsOpen(false);
  };

  const formattedDisplay = value ? formatJalaliNumeric(value) : 'انتخاب تاریخ...';

  // Year choices from 1400 to 1410
  const yearOptions = Array.from({ length: 11 }, (_, i) => 1400 + i);

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Input trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition shadow-sm"
      >
        <span className="font-mono tracking-wide font-medium">{formattedDisplay}</span>
        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
      </button>

      {/* Calendar dropdown popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-72 rounded-2xl p-3 bg-white dark:bg-[#0e172e] border border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150 right-0">
          {/* Header: Month and Year selector */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="ماه بعدی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer py-0.5"
              >
                {JALALI_MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1} className="bg-white dark:bg-slate-900">
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-cyan-600 dark:text-cyan-400 outline-none cursor-pointer py-0.5"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                    {toPersianDigits(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="ماه قبلی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center py-1">
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((day) => {
              const active = isSelected(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium transition flex items-center justify-center btn-interactive ${
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/30'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          {/* Footer action */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleToday}
              className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

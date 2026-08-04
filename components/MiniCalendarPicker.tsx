"use client";

import { useEffect, useRef, useState } from "react";

interface MiniCalendarPickerProps {
  value: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

function buildCalendarCells(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return cells;
}

const navButtonClass =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-black/60 transition-transform hover:bg-black/[.06] active:scale-90 dark:text-zinc-300 dark:hover:bg-white/[.08]";

export default function MiniCalendarPicker({
  value,
  onSelect,
  onClose,
}: MiniCalendarPickerProps) {
  const [year, setYear] = useState(value.getFullYear());
  const [month, setMonth] = useState(value.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onClose();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handlePrevMonth() {
    if (month === 0) {
      setYear((prev) => prev - 1);
      setMonth(11);
    } else {
      setMonth((prev) => prev - 1);
    }
  }

  function handleNextMonth() {
    if (month === 11) {
      setYear((prev) => prev + 1);
      setMonth(0);
    } else {
      setMonth((prev) => prev + 1);
    }
  }

  const cells = buildCalendarCells(year, month);
  const today = new Date();

  return (
    <div
      ref={containerRef}
      className="absolute top-full right-0 z-10 mt-2 w-56 rounded-2xl border border-black/10 bg-zinc-50 p-3 shadow-lg dark:border-white/15 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label="이전 달"
          className={navButtonClass}
        >
          ‹
        </button>
        <p className="text-xs font-medium text-black/70 dark:text-zinc-300">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label="다음 달"
          className={navButtonClass}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 pb-1 text-center text-[0.6rem] text-black/50 dark:text-zinc-400">
        {WEEKDAY_HEADERS.map((weekday, index) => (
          <span
            key={weekday}
            className={
              index === 0
                ? "text-red-500/70"
                : index === 6
                  ? "text-blue-500/70"
                  : undefined
            }
          >
            {weekday}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, index) => {
          if (!day) return <div key={index} />;

          const isSelected =
            value.getFullYear() === year &&
            value.getMonth() === month &&
            value.getDate() === day;
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(new Date(year, month, day))}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.7rem] transition-colors ${
                isSelected
                  ? "bg-foreground text-background"
                  : isToday
                    ? "border border-black/30 text-black dark:border-white/40 dark:text-zinc-50"
                    : "text-black/70 hover:bg-black/[.06] dark:text-zinc-300 dark:hover:bg-white/[.08]"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

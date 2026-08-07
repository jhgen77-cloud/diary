"use client";

import { useState, type FormEvent } from "react";

interface DiaryCalendarDateSearchProps {
  onSearch: (year: number, month: number, day: number) => void;
}

const dateInputClass =
  "h-8 min-w-0 rounded-full border border-[var(--border)] bg-[var(--card)] px-2 text-center text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] sm:h-9 sm:text-base";

export default function DiaryCalendarDateSearch({
  onSearch,
}: DiaryCalendarDateSearchProps) {
  const today = new Date();
  const [year, setYear] = useState(String(today.getFullYear()));
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [day, setDay] = useState(String(today.getDate()));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedYear = Number(year);
    const parsedMonth = Number(month);
    const parsedDay = Number(day);

    if (
      !Number.isFinite(parsedYear) ||
      !Number.isFinite(parsedMonth) ||
      !Number.isFinite(parsedDay) ||
      parsedMonth < 1 ||
      parsedMonth > 12 ||
      parsedDay < 1 ||
      parsedDay > 31
    ) {
      return;
    }

    onSearch(parsedYear, parsedMonth, parsedDay);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 flex-wrap items-center gap-1.5 pb-3 sm:gap-2 sm:pb-4"
    >
      <input
        type="number"
        value={year}
        onChange={(event) => setYear(event.target.value)}
        aria-label="년"
        className={`${dateInputClass} w-16 sm:w-20`}
      />
      <span className="text-sm text-[var(--text-sub)] sm:text-base">
        년
      </span>
      <input
        type="number"
        min={1}
        max={12}
        value={month}
        onChange={(event) => setMonth(event.target.value)}
        aria-label="월"
        className={`${dateInputClass} w-12 sm:w-14`}
      />
      <span className="text-sm text-[var(--text-sub)] sm:text-base">
        월
      </span>
      <input
        type="number"
        min={1}
        max={31}
        value={day}
        onChange={(event) => setDay(event.target.value)}
        aria-label="일"
        className={`${dateInputClass} w-12 sm:w-14`}
      />
      <span className="text-sm text-[var(--text-sub)] sm:text-base">
        일
      </span>
      <button
        type="submit"
        className="flex h-8 shrink-0 items-center justify-center rounded-full bg-foreground px-3 text-xs font-medium text-background transition-transform active:scale-95 sm:h-9 sm:px-4 sm:text-sm"
      >
        검색
      </button>
    </form>
  );
}

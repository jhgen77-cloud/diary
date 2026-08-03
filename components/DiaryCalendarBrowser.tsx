"use client";

import { useState } from "react";
import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryCalendarDateSearch from "@/components/DiaryCalendarDateSearch";
import DiaryCalendar from "@/components/DiaryCalendar";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface DiaryCalendarBrowserProps {
  entries: DiaryEntry[];
}

export default function DiaryCalendarBrowser({
  entries,
}: DiaryCalendarBrowserProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  function handlePrevMonth() {
    setSelectedDay(null);
    if (month === 0) {
      setYear((prev) => prev - 1);
      setMonth(11);
    } else {
      setMonth((prev) => prev - 1);
    }
  }

  function handleNextMonth() {
    setSelectedDay(null);
    if (month === 11) {
      setYear((prev) => prev + 1);
      setMonth(0);
    } else {
      setMonth((prev) => prev + 1);
    }
  }

  function handleDateSearch(
    searchYear: number,
    searchMonth: number,
    searchDay: number
  ) {
    setYear(searchYear);
    setMonth(searchMonth - 1);
    setSelectedDay(searchDay);
  }

  return (
    <>
      <DiaryToolbar />
      <DiaryCalendarDateSearch onSearch={handleDateSearch} />
      <DiaryCalendar
        entries={entries}
        year={year}
        month={month}
        selectedDay={selectedDay}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </>
  );
}

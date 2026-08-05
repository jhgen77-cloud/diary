"use client";

import { useState } from "react";
import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryCalendarDateSearch from "@/components/DiaryCalendarDateSearch";
import DiaryCalendar from "@/components/DiaryCalendar";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

interface DiaryCalendarBrowserProps {
  entries: DiaryEntry[];
}

export default function DiaryCalendarBrowser({
  entries,
}: DiaryCalendarBrowserProps) {
  const savedEntries = useSavedDiaryEntries();
  // "시간을 붙잡다"에서 저장한 글(로컬 저장)을 목업 목록 뒤에 붙여서, 같은 날짜에
  // 목업 항목이 있어도 새로 저장한 글이 달력 칸에 우선 표시되게 합니다.
  const mergedEntries = [...entries, ...savedEntries];

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
        entries={mergedEntries}
        year={year}
        month={month}
        selectedDay={selectedDay}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </>
  );
}

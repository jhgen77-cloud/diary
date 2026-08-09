"use client";

import { useState } from "react";
import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryCalendarDateSearch from "@/components/DiaryCalendarDateSearch";
import DiaryCalendar from "@/components/DiaryCalendar";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import { suppressSyncedDuplicates, suppressDeletedEntries } from "@/lib/memoryEntries";
import { useDecryptedEntries } from "@/lib/decryptDiaryEntry";

interface DiaryCalendarBrowserProps {
  /** Supabase(memory_entries)에서 Server Component가 미리 가져온 글 목록
   * (app/diary/calendar/page.tsx 등 참고) — 새로고침 직후에도 첫 렌더부터
   * 채워져 있어 클라이언트에서 다시 fetch할 때 생기던 로딩 깜빡임이 없습니다. */
  entries: DiaryEntry[];
}

export default function DiaryCalendarBrowser({
  entries,
}: DiaryCalendarBrowserProps) {
  const savedEntries = useSavedDiaryEntries();
  // 서버가 내려준 entries는 암호화된 글이면 title이 암호문 그대로일 수
  // 있어, 화면에 쓰기 전에 이 훅으로 복호화합니다(잠겨 있으면 자리표시자로
  // 대체 — lib/decryptDiaryEntry.ts 참고). savedEntries(로컬 저장, 이번 세션에
  // 직접 쓴 글)는 애초에 평문이라 그대로 씁니다.
  const decryptedEntries = useDecryptedEntries(entries);
  // "시간을 붙잡다"에서 저장한 글(로컬 저장)을 서버가 내려준 목록 뒤에 붙여서,
  // 같은 날짜에 다른 항목이 있어도 이번 세션에 새로 저장한 글이 달력 칸에
  // 우선 표시되게 합니다.
  //
  // entries(서버가 내려준 목록)에는 방금 로컬로 저장한 글이 그 사이 Supabase에도
  // 반영됐다면 "mem-<id>"로 이미 섞여 들어와 있을 수 있어, suppressSyncedDuplicates로
  // 그 원격 사본을 먼저 제외합니다(실제로 겪은 문제: 글 저장 직후 목록/달력에
  // 같은 글이 두 번 보임, memoryEntries.ts의 suppressSyncedDuplicates 참고).
  //
  // entries는 브라우저 뒤로가기로 이 화면에 돌아왔을 때 Next.js가 삭제 전
  // 스냅샷을 재사용해 지운 글이 그대로 남아있을 수도 있어(실제로 겪은 문제 —
  // 새로고침하면 정상으로 돌아옴), suppressDeletedEntries로 이번 세션에 지운
  // 글도 함께 걸러냅니다.
  const remoteEntries = suppressDeletedEntries(
    suppressSyncedDuplicates(decryptedEntries, savedEntries)
  );
  const mergedEntries = [...remoteEntries, ...savedEntries];

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

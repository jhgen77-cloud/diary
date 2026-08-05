"use client";

import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryEntryList from "@/components/DiaryEntryList";
import { sortDiaryEntriesByDateDesc, type DiaryEntry } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

interface DiaryBrowserProps {
  entries: DiaryEntry[];
  initialQuery?: string;
}

export default function DiaryBrowser({
  entries,
  initialQuery = "",
}: DiaryBrowserProps) {
  const savedEntries = useSavedDiaryEntries();
  // "시간을 붙잡다"에서 저장한 글(로컬 저장)을 목업 목록과 합쳐 등록한 날짜
  // 최신 순으로 보여줍니다. 같은 id가 있으면 저장된 글이 우선합니다.
  const savedIds = new Set(savedEntries.map((entry) => entry.id));
  const mergedEntries = sortDiaryEntriesByDateDesc([
    ...savedEntries,
    ...entries.filter((entry) => !savedIds.has(entry.id)),
  ]);

  const trimmed = initialQuery.trim();
  const filteredEntries = trimmed
    ? mergedEntries.filter((entry) => entry.title.includes(trimmed))
    : mergedEntries;

  return (
    <>
      <DiaryToolbar key={initialQuery} initialQuery={initialQuery} />
      <DiaryEntryList entries={filteredEntries} />
    </>
  );
}

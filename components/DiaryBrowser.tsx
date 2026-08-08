"use client";

import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryEntryList from "@/components/DiaryEntryList";
import { sortDiaryEntriesByDateDesc, type DiaryEntry } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import { suppressSyncedDuplicates } from "@/lib/memoryEntries";

interface DiaryBrowserProps {
  /** Supabase(memory_entries)에서 Server Component가 미리 가져온 글 목록
   * (app/diary/page.tsx 등 참고) — 새로고침 직후에도 첫 렌더부터 채워져
   * 있어 클라이언트에서 다시 fetch할 때 생기던 로딩 깜빡임이 없습니다. */
  entries: DiaryEntry[];
  initialQuery?: string;
}

export default function DiaryBrowser({
  entries,
  initialQuery = "",
}: DiaryBrowserProps) {
  const savedEntries = useSavedDiaryEntries();
  // "시간을 붙잡다"에서 저장한 글(로컬 저장)을 서버가 내려준 목록과 합쳐 등록한
  // 날짜 최신 순으로 보여줍니다. 같은 id가 있으면 저장된 글이 우선합니다.
  //
  // entries(서버가 내려준 목록)에는 방금 로컬로 저장한 글이 그 사이 Supabase에도
  // 반영됐다면 "mem-<id>"로 이미 섞여 들어와 있을 수 있습니다(로컬 uuid와 id가
  // 달라 아래 savedIds 비교만으로는 걸러지지 않음) — suppressSyncedDuplicates로
  // 먼저 그 원격 사본을 제외합니다(실제로 겪은 문제: 글 저장 직후 목록에 같은
  // 글이 두 번 보임, memoryEntries.ts의 suppressSyncedDuplicates 참고).
  const remoteEntries = suppressSyncedDuplicates(entries, savedEntries);
  const savedIds = new Set(savedEntries.map((entry) => entry.id));
  const mergedEntries = sortDiaryEntriesByDateDesc([
    ...savedEntries,
    ...remoteEntries.filter((entry) => !savedIds.has(entry.id)),
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

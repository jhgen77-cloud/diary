"use client";

import { useMemo, useState } from "react";
import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryEntryList from "@/components/DiaryEntryList";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface DiaryBrowserProps {
  entries: DiaryEntry[];
}

export default function DiaryBrowser({ entries }: DiaryBrowserProps) {
  const [query, setQuery] = useState("");

  const filteredEntries = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return entries;
    return entries.filter((entry) => entry.title.includes(trimmed));
  }, [entries, query]);

  return (
    <>
      <DiaryToolbar onSearch={setQuery} />
      <DiaryEntryList entries={filteredEntries} />
    </>
  );
}

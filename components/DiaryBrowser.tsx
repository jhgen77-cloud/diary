import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryEntryList from "@/components/DiaryEntryList";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface DiaryBrowserProps {
  entries: DiaryEntry[];
  initialQuery?: string;
}

export default function DiaryBrowser({
  entries,
  initialQuery = "",
}: DiaryBrowserProps) {
  const trimmed = initialQuery.trim();
  const filteredEntries = trimmed
    ? entries.filter((entry) => entry.title.includes(trimmed))
    : entries;

  return (
    <>
      <DiaryToolbar key={initialQuery} initialQuery={initialQuery} />
      <DiaryEntryList entries={filteredEntries} />
    </>
  );
}

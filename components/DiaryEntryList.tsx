import DiaryEntryItem from "@/components/DiaryEntryItem";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface DiaryEntryListProps {
  entries: DiaryEntry[];
}

export default function DiaryEntryList({ entries }: DiaryEntryListProps) {
  return (
    <ul className="flex min-h-0 max-h-[22rem] flex-1 flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[28rem] sm:gap-3">
      {entries.map((entry) => (
        <DiaryEntryItem key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}

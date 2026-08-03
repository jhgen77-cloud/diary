import DiaryToolbar from "@/components/DiaryToolbar";
import DiaryCalendar from "@/components/DiaryCalendar";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface DiaryCalendarBrowserProps {
  entries: DiaryEntry[];
}

export default function DiaryCalendarBrowser({
  entries,
}: DiaryCalendarBrowserProps) {
  return (
    <>
      <DiaryToolbar />
      <DiaryCalendar entries={entries} />
    </>
  );
}

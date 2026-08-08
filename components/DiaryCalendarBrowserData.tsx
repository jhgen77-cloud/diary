import DiaryCalendarBrowser from "@/components/DiaryCalendarBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

/** 달력 화면판 DiaryBrowserData — 같은 이유로 Supabase 조회 부분만 따로 떼어
 * <Suspense>로 감쌀 수 있게 합니다(DiaryBrowserData.tsx 참고). */
export default async function DiaryCalendarBrowserData() {
  const entries = await fetchMemoryEntriesServer();
  return <DiaryCalendarBrowser entries={entries} />;
}

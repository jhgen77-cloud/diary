import Modal from "@/components/Modal";
import DiaryCalendarBrowser from "@/components/DiaryCalendarBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

// app/@modal/(.)diary/calendar/page.tsx와 내용이 같습니다. 직접 접속/새로고침
// 시엔 인터셉트 라우트가 적용되지 않으므로 같은 내용을 그대로 미러링합니다.
// Supabase 글 목록은 여기서(Server Component) 미리 가져와 내려줍니다 —
// 새로고침 직후 달력이 잠깐 비었다가 채워지는 깜빡임을 없애기 위함입니다.
export default async function DiaryCalendarPage() {
  const entries = await fetchMemoryEntriesServer();

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryCalendarBrowser entries={entries} />
    </Modal>
  );
}

import Modal from "@/components/Modal";
import DiaryCalendarBrowser from "@/components/DiaryCalendarBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

// app/diary/calendar/page.tsx와 내용이 같습니다 — 새로고침 깜빡임을 없애기
// 위해 Supabase 글 목록을 여기서(Server Component) 미리 가져와 내려줍니다.
export default async function DiaryCalendarModal() {
  const entries = await fetchMemoryEntriesServer();

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryCalendarBrowser entries={entries} />
    </Modal>
  );
}

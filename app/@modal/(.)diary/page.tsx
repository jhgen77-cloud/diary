import Modal from "@/components/Modal";
import DiaryBrowser from "@/components/DiaryBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

// app/diary/page.tsx와 내용이 같습니다 — 새로고침 깜빡임을 없애기 위해
// Supabase 글 목록을 여기서(Server Component) 미리 가져와 내려줍니다.
export default async function DiaryModal({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const entries = await fetchMemoryEntriesServer();

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryBrowser entries={entries} initialQuery={q} />
    </Modal>
  );
}

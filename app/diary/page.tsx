import Modal from "@/components/Modal";
import DiaryBrowser from "@/components/DiaryBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

// app/@modal/(.)diary/page.tsx와 내용이 같습니다. "/"에서 클릭해 들어오면
// 그쪽(가로채기 라우트)이 모달로 띄우지만, 이 경로로 직접 접속하거나 새로고침
// 하면 인터셉트가 적용되지 않아 이 페이지(children 슬롯)만 그대로 렌더링됩니다
// — 그때도 "아직 준비 중입니다" 같은 빈 화면 대신 같은 내용을 보여주기 위해
// 그대로 미러링합니다.
//
// Supabase 글 목록은 Server Component인 여기서 미리 가져와 내려줍니다 —
// 클라이언트에서 마운트 후 다시 fetch하면 새로고침 직후 목록이 잠깐 비었다가
// 채워지는 깜빡임이 생겼습니다(실제로 겪은 문제).
export default async function DiaryPage({
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

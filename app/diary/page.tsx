import Modal from "@/components/Modal";
import DiaryBrowser from "@/components/DiaryBrowser";
import { mockDiaryEntries } from "@/lib/mockDiaryEntries";

// app/@modal/(.)diary/page.tsx와 내용이 같습니다. "/"에서 클릭해 들어오면
// 그쪽(가로채기 라우트)이 모달로 띄우지만, 이 경로로 직접 접속하거나 새로고침
// 하면 인터셉트가 적용되지 않아 이 페이지(children 슬롯)만 그대로 렌더링됩니다
// — 그때도 "아직 준비 중입니다" 같은 빈 화면 대신 같은 내용을 보여주기 위해
// 그대로 미러링합니다.
export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryBrowser entries={mockDiaryEntries} initialQuery={q} />
    </Modal>
  );
}

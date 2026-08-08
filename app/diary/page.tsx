import { Suspense } from "react";
import Modal from "@/components/Modal";
import DiaryBrowserData from "@/components/DiaryBrowserData";
import DiaryLoadingIndicator from "@/components/DiaryLoadingIndicator";

// app/@modal/(.)diary/page.tsx와 내용이 같습니다. "/"에서 클릭해 들어오면
// 그쪽(가로채기 라우트)이 모달로 띄우지만, 이 경로로 직접 접속하거나 새로고침
// 하면 인터셉트가 적용되지 않아 이 페이지(children 슬롯)만 그대로 렌더링됩니다
// — 그때도 "아직 준비 중입니다" 같은 빈 화면 대신 같은 내용을 보여주기 위해
// 그대로 미러링합니다.
//
// Supabase 글 목록 조회(DiaryBrowserData)만 <Suspense>로 감싸, 그 응답을
// 기다리는 동안에도 Modal(제목/닫기 버튼)은 즉시 뜨도록 분리했습니다 — 가끔
// Supabase 응답이 느릴 때 클릭 후 화면 자체가 늦게 뜨는 것처럼 보이던
// 문제(실제로 겪은 문제)의 원인이었습니다.
export default async function DiaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <Suspense fallback={<DiaryLoadingIndicator />}>
        <DiaryBrowserData initialQuery={q} />
      </Suspense>
    </Modal>
  );
}

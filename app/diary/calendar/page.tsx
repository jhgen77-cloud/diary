import { Suspense } from "react";
import Modal from "@/components/Modal";
import DiaryCalendarBrowserData from "@/components/DiaryCalendarBrowserData";
import DiaryLoadingIndicator from "@/components/DiaryLoadingIndicator";

// app/@modal/(.)diary/calendar/page.tsx와 내용이 같습니다. 직접 접속/새로고침
// 시엔 인터셉트 라우트가 적용되지 않으므로 같은 내용을 그대로 미러링합니다.
// Supabase 글 목록 조회(DiaryCalendarBrowserData)만 <Suspense>로 감싸, 그
// 응답을 기다리는 동안에도 Modal(제목/닫기 버튼)은 즉시 뜨도록 분리했습니다 —
// 가끔 Supabase 응답이 느릴 때 클릭 후 화면 자체가 늦게 뜨는 것처럼 보이던
// 문제(실제로 겪은 문제)의 원인이었습니다.
export default async function DiaryCalendarPage() {
  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <Suspense fallback={<DiaryLoadingIndicator />}>
        <DiaryCalendarBrowserData />
      </Suspense>
    </Modal>
  );
}

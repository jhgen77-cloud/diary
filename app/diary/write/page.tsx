import { Suspense } from "react";
import Modal from "@/components/Modal";
import DiaryWriteForm from "@/components/DiaryWriteForm";

// app/@modal/(.)diary/write/page.tsx와 내용이 같습니다. 직접 접속/새로고침 시엔
// 인터셉트 라우트가 적용되지 않아 이 파일(children 슬롯)만 렌더링되므로, 같은
// 내용을 그대로 미러링해 두 경로 모두에서 같은 화면이 보이게 합니다.
export default function DiaryWritePage() {
  return (
    <Suspense fallback={<Modal title="시간을 붙잡다" size="xl" tall>{null}</Modal>}>
      <DiaryWriteForm />
    </Suspense>
  );
}

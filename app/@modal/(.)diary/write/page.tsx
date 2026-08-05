import { Suspense } from "react";
import Modal from "@/components/Modal";
import DiaryWriteForm from "@/components/DiaryWriteForm";

// DiaryWriteForm은 useSearchParams()를 쓰기 때문에 Suspense 경계가 필요합니다.
// fallback을 null로 두면 그 사이(특히 이 코드가 아직 브라우저에 받아지지 않은
// 첫 전환 때) 모달이 통째로 사라져 배경의 메인 인덱스 페이지가 잠깐
// 보였다가 글쓰기 모달창으로 바뀌는 것처럼 보이는 버그가 있었습니다.
// 같은 Modal 뼈대를 fallback으로 띄워 그 틈에도 모달이 계속 떠 있게 합니다.
export default function DiaryWriteModal() {
  return (
    <Suspense fallback={<Modal title="시간을 붙잡다" size="lg" tall>{null}</Modal>}>
      <DiaryWriteForm />
    </Suspense>
  );
}

import type { Metadata } from "next";
import Modal from "@/components/Modal";
import HelpContent from "@/components/HelpContent";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "도움말",
  "기억 앱 사용법을 안내합니다."
);

// app/@modal/(.)info/help/page.tsx와 내용이 같습니다. 직접 접속/새로고침
// 시엔 인터셉트 라우트가 적용되지 않으므로(다른 경로들과 같은 이유) 같은
// 내용을 그대로 미러링합니다.
//
// closeHref="/info"를 일부러 안 씁니다 — Modal의 closeHref는 router.push라
// "이미 기록에 있는 /info"를 또 하나 더 쌓아버려서, 그 뒤 정보 모달 자체의
// "닫기"(router.back())를 누르면 그 중복 항목 하나만 되돌아가 도움말
// 페이지로 다시 튕기는 문제가 있었습니다(실제로 겪은 문제) — 도움말은
// 항상 정보 모달의 "도움말" 버튼을 통해서만 들어오므로, 기본값(router.back())
// 이 항상 안전하게 정보 모달로 돌아갑니다.
export default function InfoHelpPage() {
  return (
    <Modal title="도움말" size="xl" tall>
      <HelpContent />
    </Modal>
  );
}

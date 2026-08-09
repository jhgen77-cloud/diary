import Modal from "@/components/Modal";
import HelpContent from "@/components/HelpContent";

/** 정보 모달의 "도움말" 버튼을 눌러 들어오면 이 가로채기 라우트가 모달로
 * 띄웁니다(app/@modal/(.)info/page.tsx의 InfoSidebar 참고).
 *
 * closeHref="/info"를 일부러 안 씁니다 — router.push라 이미 기록에 있는
 * "/info"를 하나 더 쌓아버려서, 그 뒤 정보 모달의 "닫기"(router.back())를
 * 누르면 그 중복 항목만 되돌아가 도움말 페이지로 다시 튕기는 문제가
 * 있었습니다(실제로 겪은 문제) — 기본값(router.back())이 항상 안전하게
 * 정보 모달로 돌아갑니다. */
export default function InfoHelpModal() {
  return (
    <Modal title="도움말" size="xl" tall>
      <HelpContent />
    </Modal>
  );
}

import Modal from "@/components/Modal";
import BackupGuideContent from "@/components/BackupGuideContent";

/** 도움말 페이지의 "※ 데이터 백업 및 복원방법 안내" 링크를 누르면 이
 * 가로채기 라우트가 모달로 띄웁니다(lib/helpContent.ts 참고).
 *
 * closeHref를 일부러 안 씁니다 — router.push는 이미 기록에 있는 항목을
 * 중복으로 쌓아 상위 모달의 "닫기"가 엉뚱한 곳으로 튕기는 문제가
 * 있었습니다(app/info/help/page.tsx에서 실제로 겪은 문제와 동일한 이유) —
 * 기본값(router.back())이 항상 안전하게 도움말 페이지로 돌아갑니다.
 *
 * size="xl" tall: app/info/help/backup/page.tsx와 같은 이유(구획 3개 분량의
 * 안내 내용)로 기본 크기보다 넓고 높게 띄웁니다. */
export default function BackupGuideModal() {
  return (
    <Modal title="데이터 백업 및 복원방법 안내" size="xl" tall>
      <BackupGuideContent />
    </Modal>
  );
}

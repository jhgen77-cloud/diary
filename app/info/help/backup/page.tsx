import type { Metadata } from "next";
import Modal from "@/components/Modal";
import BackupGuideContent from "@/components/BackupGuideContent";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "데이터 백업 및 복원방법 안내",
  "일기 데이터를 백업하고 복원하는 방법을 안내합니다."
);

// app/@modal/(.)info/help/backup/page.tsx와 내용이 같습니다. 직접 접속/
// 새로고침 시엔 인터셉트 라우트가 적용되지 않으므로(다른 경로들과 같은
// 이유) 같은 내용을 그대로 미러링합니다.
//
// closeHref를 일부러 안 씁니다 — 이 링크는 항상 도움말 페이지의 "※ 데이터
// 백업 및 복원방법 안내"를 통해서만 들어오므로, 기본값(router.back())이
// 항상 안전하게 도움말 페이지로 돌아갑니다(app/info/help/page.tsx와 같은
// 이유로 closeHref="push" 방식을 피함).
export default function BackupGuidePage() {
  return (
    <Modal title="데이터 백업 및 복원방법 안내">
      <BackupGuideContent />
    </Modal>
  );
}

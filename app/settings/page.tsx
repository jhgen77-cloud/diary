import type { Metadata } from "next";
import Modal from "@/components/Modal";
import SettingsManager from "@/components/SettingsManager";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "환경 설정",
  "일기장의 글꼴과 배경을 취향에 맞게 꾸며보세요."
);

// app/@modal/(.)settings/page.tsx와 내용이 같습니다. 직접 접속/새로고침 시엔
// 인터셉트 라우트가 적용되지 않으므로(다른 /diary, /data 경로와 같은 이유) 같은
// 내용을 그대로 미러링해, 빈 페이지 대신 같은 화면이 보이게 합니다.
export default function SettingsPage() {
  return (
    <Modal
      title="환경 설정"
      size="xl"
      heightVh={86}
      overlay={false}
      showWindowControls={false}
      showCloseButton={false}
    >
      <SettingsManager />
    </Modal>
  );
}

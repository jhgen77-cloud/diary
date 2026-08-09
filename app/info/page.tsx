import type { Metadata } from "next";
import Modal from "@/components/Modal";
import InfoManager from "@/components/InfoManager";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "정보",
  "기억 앱의 버전 정보와 도움말을 확인하세요."
);

// app/@modal/(.)info/page.tsx와 내용이 같습니다. 직접 접속/새로고침 시엔
// 인터셉트 라우트가 적용되지 않으므로(다른 /diary, /data, /settings 경로와
// 같은 이유) 같은 내용을 그대로 미러링해, 빈 페이지 대신 같은 화면이 보이게 합니다.
export default function InfoPage() {
  return (
    <Modal title="정보" size="xl" heightVh={86} closeHref="/">
      <InfoManager />
    </Modal>
  );
}

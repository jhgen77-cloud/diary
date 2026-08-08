import type { Metadata } from "next";
import Modal from "@/components/Modal";
import DataManager from "@/components/DataManager";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "기억의 유실을 회복하다",
  "백업하고 복원하며 데이터를 안전하게 관리하세요."
);

// app/@modal/(.)data/page.tsx와 내용이 같습니다. 직접 접속/새로고침 시엔
// 인터셉트 라우트가 적용되지 않으므로 같은 내용을 그대로 미러링합니다.
export default function DataPage() {
  return (
    <Modal
      title="기억의 유실을 회복하다"
      size="xl"
      heightVh={86}
      overlay={false}
      showWindowControls={false}
      showCloseButton={false}
    >
      <DataManager />
    </Modal>
  );
}

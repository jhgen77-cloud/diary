import Modal from "@/components/Modal";
import DataManager from "@/components/DataManager";

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

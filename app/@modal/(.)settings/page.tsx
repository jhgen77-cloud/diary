import Modal from "@/components/Modal";
import SettingsManager from "@/components/SettingsManager";

/** '/' 에서 설정 아이콘을 눌러 들어오면 이 가로채기 라우트가 모달로 띄웁니다.
 * DataManager 모달과 같은 레이아웃(요구사항)을 그대로 재사용합니다. */
export default function SettingsModal() {
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

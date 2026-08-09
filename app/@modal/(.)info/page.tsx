import Modal from "@/components/Modal";
import InfoManager from "@/components/InfoManager";

/** '/' 에서 info.png를 눌러 들어오면 이 가로채기 라우트가 모달로 띄웁니다. */
export default function InfoModal() {
  return (
    <Modal title="정보" size="xl" heightVh={86} closeHref="/">
      <InfoManager />
    </Modal>
  );
}

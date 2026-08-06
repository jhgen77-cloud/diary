import Modal from "@/components/Modal";
import DataManager from "@/components/DataManager";

export default function DataModal() {
  return (
    <Modal title="기억의 유실을 회복하다" size="lg" heightVh={64}>
      <DataManager />
    </Modal>
  );
}

import Modal from "@/components/Modal";
import DiaryWriteForm from "@/components/DiaryWriteForm";

export default function DiaryWriteModal() {
  return (
    <Modal title="시간을 붙잡다" size="lg" tall>
      <DiaryWriteForm />
    </Modal>
  );
}

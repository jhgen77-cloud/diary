import Modal from "@/components/Modal";
import DiaryBrowser from "@/components/DiaryBrowser";
import { mockDiaryEntries } from "@/lib/mockDiaryEntries";

export default function DiaryModal() {
  return (
    <Modal title="그날을 거닐다" size="lg">
      <DiaryBrowser entries={mockDiaryEntries} />
    </Modal>
  );
}

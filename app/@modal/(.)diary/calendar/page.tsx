import Modal from "@/components/Modal";
import DiaryCalendarBrowser from "@/components/DiaryCalendarBrowser";
import { mockDiaryEntries } from "@/lib/mockDiaryEntries";

export default function DiaryCalendarModal() {
  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryCalendarBrowser entries={mockDiaryEntries} />
    </Modal>
  );
}

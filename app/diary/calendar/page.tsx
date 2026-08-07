import Modal from "@/components/Modal";
import DiaryCalendarBrowser from "@/components/DiaryCalendarBrowser";
import { mockDiaryEntries } from "@/lib/mockDiaryEntries";

// app/@modal/(.)diary/calendar/page.tsx와 내용이 같습니다. 직접 접속/새로고침
// 시엔 인터셉트 라우트가 적용되지 않으므로 같은 내용을 그대로 미러링합니다.
export default function DiaryCalendarPage() {
  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryCalendarBrowser entries={mockDiaryEntries} />
    </Modal>
  );
}

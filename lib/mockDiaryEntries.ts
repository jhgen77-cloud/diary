import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";
import type { DiaryContentStyle, DiaryTitleStyle } from "@/lib/environmentSettings";

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: MoodKey;
  weather: WeatherKey | null;
  hasAttachment: boolean;
  /** 첨부 이미지(리사이즈된 data URL 목록) — 좌측부터 첨부한 순서 */
  images: string[];
  /** 최초로 저장된 시각 (ISO 문자열) — 상세 보기의 "작성된 일기입니다" 문구에 사용 */
  createdAt: string;
  /** "시간을 붙잡다"에서 저장할 당시 적용돼 있던 환경 설정(제목/본문 각각).
   * 그 모달에서만 쓰는 값이라 선택 필드이며, 이 값이 없는(옛/다른 경로로 만든)
   * 일기는 기본 스타일로 표시됩니다. */
  titleStyle?: DiaryTitleStyle;
  contentStyle?: DiaryContentStyle;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 임시 목업 일기는 모두 제거했습니다 — 목록/달력에는 사용자가 실제로 저장한
// 글만 표시됩니다 (@/lib/savedDiaryEntries 참고).
const RAW_ENTRIES: DiaryEntry[] = [];

export function sortDiaryEntriesByDateDesc(entries: DiaryEntry[]) {
  return [...entries].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const mockDiaryEntries = sortDiaryEntriesByDateDesc(RAW_ENTRIES);

export function getDiaryEntryById(id: string) {
  return mockDiaryEntries.find((entry) => entry.id === id);
}

export function formatDiaryDate(dateStr: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: WEEKDAYS_KO[date.getDay()],
  };
}

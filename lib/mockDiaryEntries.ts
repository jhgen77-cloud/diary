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
  /** 마지막으로 고쳐 저장한 시각 (ISO 문자열) — 한 번도 수정한 적 없으면 없음.
   * 상세 보기에서 "OO에 수정되었습니다" 문구로 원본이 바뀌었음을 알리는 데
   * 씁니다. */
  updatedAt?: string;
  /** "시간을 붙잡다"에서 저장할 당시 적용돼 있던 환경 설정(제목/본문 각각).
   * 그 모달에서만 쓰는 값이라 선택 필드이며, 이 값이 없는(옛/다른 경로로 만든)
   * 일기는 기본 스타일로 표시됩니다. */
  titleStyle?: DiaryTitleStyle;
  contentStyle?: DiaryContentStyle;
  /** Supabase에서 곧바로 읽어온 글이면 "remote" — 아직 수정/삭제를 Supabase에
   * 반영하는 기능은 없어(저장 시 추가만 구현), 상세 화면에서 해당 버튼을
   * 숨기는 데 씁니다. */
  source?: "remote";
  /** true면 title/content가 평문이 아니라 암호문(base64)입니다 — "일기 암호"를
   * 설정한 뒤 저장한 글만 해당(lib/diaryEncryptionKey.ts 참고). 화면에 쓰기
   * 전엔 반드시 lib/decryptDiaryEntry.ts의 decryptDiaryEntryForDisplay를
   * 거쳐야 합니다. */
  encrypted?: boolean;
  /** title 암호화에 쓰인 IV(base64). encrypted가 true일 때만 있습니다. */
  titleIv?: string;
  /** content(본문) 암호화에 쓰인 IV(base64). encrypted가 true일 때만 있습니다. */
  contentIv?: string;
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

/** 이 글을 아직 수정할 수 있는지 — 작성한 날짜(entry.date)가 오늘이 아니면
 * (하루가 지나면) 더 이상 고칠 수 없다는 정책입니다. "쓴 지 24시간"이 아니라
 * 그 날짜의 자정이 지나는 순간 잠깁니다(하루에 하나만 쓸 수 있는 일기라는
 * 이 앱의 기본 전제와 맞춰, "그날" 안에서만 고칠 수 있게 함). */
export function isDiaryEntryEditable(entry: DiaryEntry): boolean {
  return entry.date === formatLocalDate(new Date());
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

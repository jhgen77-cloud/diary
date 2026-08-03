export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export const mockDiaryEntries: DiaryEntry[] = [
  { id: "1", date: "2026-08-03", title: "여름 끝자락의 소나기" },
  { id: "2", date: "2026-08-01", title: "말없이 걷던 저녁" },
  { id: "3", date: "2026-07-29", title: "낡은 사진 한 장" },
  { id: "4", date: "2026-07-25", title: "빗소리에 잠긴 하루" },
  { id: "5", date: "2026-07-20", title: "창가에 머문 햇살" },
  { id: "6", date: "2026-07-15", title: "잊고 있던 약속" },
  { id: "7", date: "2026-07-10", title: "먼 곳에서 온 편지" },
].sort((a, b) => (a.date < b.date ? 1 : -1));

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

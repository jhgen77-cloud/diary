import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  mood: MoodKey;
  weather: WeatherKey | null;
  hasAttachment: boolean;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgo(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return formatLocalDate(date);
}

const RAW_ENTRIES: DiaryEntry[] = [
  {
    id: "1",
    date: daysAgo(0),
    title: "여름 끝자락의 소나기",
    mood: "sad",
    weather: "rain",
    hasAttachment: true,
  },
  {
    id: "2",
    date: daysAgo(2),
    title: "말없이 걷던 저녁",
    mood: "sarcastic",
    weather: "cloudly",
    hasAttachment: false,
  },
  {
    id: "3",
    date: daysAgo(5),
    title: "낡은 사진 한 장",
    mood: "smile",
    weather: "brightness",
    hasAttachment: true,
  },
  {
    id: "4",
    date: daysAgo(9),
    title: "빗소리에 잠긴 하루",
    mood: "bad",
    weather: "rain",
    hasAttachment: false,
  },
  {
    id: "5",
    date: daysAgo(14),
    title: "창가에 머문 햇살",
    mood: "smile",
    weather: "brightness",
    hasAttachment: false,
  },
  {
    id: "6",
    date: daysAgo(19),
    title: "잊고 있던 약속",
    mood: "angry",
    weather: "thunderstorm",
    hasAttachment: false,
  },
  {
    id: "7",
    date: daysAgo(24),
    title: "먼 곳에서 온 편지",
    mood: "sad",
    weather: "haze",
    hasAttachment: true,
  },
];

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

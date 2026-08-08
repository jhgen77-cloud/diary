import { formatLocalDate, type DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_ICONS, WEATHER_ICONS, type MoodKey, type WeatherKey } from "@/lib/diaryIcons";

/** memory_entries 관련 로직 중 클라이언트(lib/memoryEntries.ts)와 서버
 * (lib/memoryEntries.server.ts) 양쪽에서 똑같이 필요한 부분만 모아둔 파일입니다.
 * "use client"가 없어 Server Component에서도 그대로 import할 수 있습니다. */

// memory_entries에서 읽어온 글의 id는 "mem-<bigint>" 형태로 만듭니다 — 로컬
// (crypto.randomUUID) id와 겹칠 일이 없고, 나중에 이 id를 다시 받았을 때
// "Supabase에서 읽어와야 하는 글"임을 알아볼 수 있습니다.
export const REMOTE_ID_PREFIX = "mem-";

// toLocalWallClockTimestamp(lib/memoryEntries.ts)의 반대 방향 변환입니다.
// 저장할 때 로컬 벽시계 값(연/월/일/시/분/초)을 UTC인 것처럼 보냈으므로,
// 읽어올 때는 그 값을 UTC 게터(getUTCFullYear 등)로 그대로 꺼내 다시
// "로컬 시각"으로 재구성해야 원래 작성 시각과 일치합니다(로컬 게터로 바로
// 읽으면 시간대만큼 한 번 더 밀립니다).
function fromLocalWallClockTimestamp(pgTimestamp: string): Date {
  const utc = new Date(pgTimestamp);
  return new Date(
    utc.getUTCFullYear(),
    utc.getUTCMonth(),
    utc.getUTCDate(),
    utc.getUTCHours(),
    utc.getUTCMinutes(),
    utc.getUTCSeconds()
  );
}

const MOOD_KEYS = Object.keys(MOOD_ICONS) as MoodKey[];
const WEATHER_KEYS = Object.keys(WEATHER_ICONS) as WeatherKey[];

function isMoodKey(value: unknown): value is MoodKey {
  return typeof value === "string" && (MOOD_KEYS as string[]).includes(value);
}

function isWeatherKey(value: unknown): value is WeatherKey {
  return typeof value === "string" && (WEATHER_KEYS as string[]).includes(value);
}

export interface MemoryEntryRow {
  id: number;
  title: string;
  text?: string;
  /** 목록/달력 조회(fetchMemoryEntries)는 화면에 그리지도 않는 이미지 데이터를
   * 아낄 겸 이 컬럼 자체를 select하지 않습니다 — 그때는 undefined입니다.
   * 상세 조회(fetchMemoryEntryById)만 실제 배열을 채워 넣습니다. */
  image?: string[] | null;
  /** "첨부 있음" 여부만 담는 가벼운 컬럼. image를 select하지 않는 목록/달력
   * 조회에서 hasAttachment를 계산하는 데 씁니다. */
  has_attachment?: boolean;
  created_at: string;
  mood_key: string;
  weather_key: string | null;
}

/** memory_entries 행을 DiaryEntry로 변환합니다. mood_key/weather_key만으로
 * 기분/날씨를 복원해 기존 MOOD_ICONS/WEATHER_ICONS로 그립니다(다른 로컬
 * 글과 동일한 방식) — 예전엔 mood/weather 컬럼에 아이콘 이미지 데이터 자체가
 * 따로 들어있어 그 컬럼이 없던 옛 행을 위한 폴백 렌더링(moodImageSrc 등)이
 * 있었지만, 그 컬럼을 스키마에서 제거하면서(중복 저장이라 늘 mood_key/
 * weather_key만 쓰였음) 함께 걷어냈습니다.
 *
 * image가 select된 경우(상세 조회)엔 그 배열 길이로 hasAttachment를 정확히
 * 계산하고, select되지 않은 경우(목록/달력 조회)엔 has_attachment 컬럼 값을
 * 그대로 씁니다. */
export function rowToEntry(row: MemoryEntryRow): DiaryEntry {
  const localCreatedAt = fromLocalWallClockTimestamp(row.created_at);

  return {
    id: `${REMOTE_ID_PREFIX}${row.id}`,
    date: formatLocalDate(localCreatedAt),
    title: row.title,
    content: row.text ?? "",
    mood: isMoodKey(row.mood_key) ? row.mood_key : "none",
    weather: isWeatherKey(row.weather_key) ? row.weather_key : null,
    hasAttachment: Array.isArray(row.image) ? row.image.length > 0 : !!row.has_attachment,
    images: row.image ?? [],
    createdAt: localCreatedAt.toISOString(),
    source: "remote",
  };
}

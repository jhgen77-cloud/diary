import { formatLocalDate, type DiaryEntry } from "@/lib/mockDiaryEntries";
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  WEATHER_UNSELECTED_LABEL,
  type MoodKey,
  type WeatherKey,
} from "@/lib/diaryIcons";

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
  mood: string;
  weather: string;
  image: string[] | null;
  created_at: string;
  mood_key: string;
  weather_key: string | null;
}

/** memory_entries 행을 DiaryEntry로 변환합니다. mood/weather 컬럼엔 이미지
 * 데이터가, mood_key/weather_key 컬럼엔 실제 선택 키가 들어있습니다 — 화면
 * 렌더링은 mood_key/weather_key를 신뢰해 기존 MOOD_ICONS/WEATHER_ICONS로
 * 그대로 그리고(다른 로컬 글과 동일한 방식), moodImageSrc/weatherImageSrc는
 * 이 컬럼들이 아직 없던(마이그레이션 이전) 옛 행처럼 키를 알 수 없을 때만
 * 대신 씁니다. */
export function rowToEntry(row: MemoryEntryRow): DiaryEntry {
  const localCreatedAt = fromLocalWallClockTimestamp(row.created_at);
  const hasWeatherImage = row.weather !== WEATHER_UNSELECTED_LABEL;
  const hasMoodKey = isMoodKey(row.mood_key);
  const hasWeatherKey = isWeatherKey(row.weather_key);

  return {
    id: `${REMOTE_ID_PREFIX}${row.id}`,
    date: formatLocalDate(localCreatedAt),
    title: row.title,
    content: row.text ?? "",
    mood: hasMoodKey ? (row.mood_key as MoodKey) : "none",
    weather: hasWeatherKey ? (row.weather_key as WeatherKey) : null,
    hasAttachment: Array.isArray(row.image) && row.image.length > 0,
    images: row.image ?? [],
    createdAt: localCreatedAt.toISOString(),
    // mood_key/weather_key가 없는(마이그레이션 이전) 옛 행에서만 저장된
    // 이미지를 직접 그립니다 — 키가 있으면 다른 로컬 글과 똑같이
    // MOOD_ICONS/WEATHER_ICONS로 그립니다.
    moodImageSrc: hasMoodKey ? undefined : row.mood,
    weatherImageSrc: !hasWeatherKey && hasWeatherImage ? row.weather : undefined,
    source: "remote",
  };
}

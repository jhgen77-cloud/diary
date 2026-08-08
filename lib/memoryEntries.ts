"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { removeSavedDiaryEntry } from "@/lib/savedDiaryEntries";
import { MOOD_ICONS, WEATHER_ICONS, WEATHER_UNSELECTED_LABEL, type MoodKey, type WeatherKey } from "@/lib/diaryIcons";
import { REMOTE_ID_PREFIX, rowToEntry } from "@/lib/memoryEntriesShared";

/** 이미지(png/jpeg 등) URL을 실제로 fetch해 data URL 문자열로 인코딩합니다.
 * mood/weather 컬럼에는 파일명이 아니라 이미지 데이터 자체를 저장해야 해서
 * 필요합니다. */
function urlToDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        })
    );
}

// mood/weather 아이콘은 종류가 고정돼 있어, 한 번 인코딩한 결과를 세션 동안
// 재사용합니다(저장할 때마다 같은 이미지를 매번 다시 fetch/인코딩할 필요가
// 없습니다).
const moodIconDataUrlCache = new Map<MoodKey, Promise<string>>();
const weatherIconDataUrlCache = new Map<WeatherKey, Promise<string>>();

function getMoodIconDataUrl(mood: MoodKey): Promise<string> {
  let cached = moodIconDataUrlCache.get(mood);
  if (!cached) {
    cached = urlToDataUrl(MOOD_ICONS[mood].src);
    moodIconDataUrlCache.set(mood, cached);
  }
  return cached;
}

function getWeatherIconDataUrl(weather: WeatherKey): Promise<string> {
  let cached = weatherIconDataUrlCache.get(weather);
  if (!cached) {
    cached = urlToDataUrl(WEATHER_ICONS[weather].src);
    weatherIconDataUrlCache.set(weather, cached);
  }
  return cached;
}

// 이번 세션에서 저장 직후 Supabase에도 반영된 글의 (로컬 id → 원격 id) 매핑.
// 로컬 저장소(useSavedDiaryEntries)엔 저장하자마자 즉시 반영되는데, 이후
// 목록 화면이 다시 마운트되며 Supabase 조회(useMemoryEntries)까지 실행되면
// 같은 글이 로컬 항목과 원격 항목 두 개로 겹쳐 보이는 문제가 있었습니다
// (실제로 재현해 확인함). 로컬 항목이 화면에 남아있는 동안엔 그 글의 원격
// 사본을 목록에서 제외해 이 중복을 막습니다.
const syncedRemoteIds = new Map<string, string>();

// entry.createdAt은 new Date().toISOString()으로 만든 UTC 기준 문자열입니다.
// 이 앱은 로컬(KST) 사용을 기준으로 하는데, Supabase 프로젝트의 세션
// 타임존은 UTC라 이 값을 그대로 넣으면 자정 근처(0~9시 KST)에 쓴 글의
// created_at 날짜가 하루 전으로 밀려 보입니다(예: KST 8/8 02:56에 저장한
// 글이 "2026-08-07 17:56+00"로 저장됨 — 실제로 확인한 문제).
// created_at 컬럼에는 "글이 작성된 년/월/일"이 그대로 보여야 하므로, 로컬
// 벽시계 값(연/월/일/시/분/초)을 시간대 오프셋 없이 그대로 문자열로 만들어
// 보냅니다. 세션 타임존이 UTC이므로 Postgres가 이 숫자들을 그대로(변환 없이)
// UTC로 저장해, 결과적으로 로컬에서 본 년/월/일과 일치하게 됩니다.
function toLocalWallClockTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

interface EncodedEntryFields {
  title: string;
  text: string;
  mood: string;
  weather: string;
  image: string[] | null;
  created_at: string;
  /** 실제 선택된 기분/날씨 키(예: "smile", "rain"). mood/weather 컬럼엔
   * 이미지 데이터만 들어있어 원래 키를 되짚을 수 없어서, 수정 화면을 다시
   * 열었을 때 기분/날씨를 정확히 복원하려면 이 값이 따로 필요합니다. */
  mood_key: MoodKey;
  weather_key: WeatherKey | null;
}

/** insertMemoryEntry/updateMemoryEntry가 공통으로 쓰는 컬럼 값 인코딩. mood
 * 컬럼에는 파일명이 아니라 실제 png/jpeg 이미지(data URL)를 저장하고, weather
 * 컬럼은 선택하지 않았으면 텍스트("[선택안함]"), 선택했으면 mood와 같은
 * 방식으로 실제 이미지(data URL)를 저장합니다. image 컬럼은 text[]라 첨부한
 * 이미지(최대 5장, MAX_IMAGES 기준)를 그대로 배열로 저장합니다(첨부 없으면
 * null). */
async function encodeEntryFields(entry: DiaryEntry): Promise<EncodedEntryFields> {
  const [moodImage, weatherValue] = await Promise.all([
    getMoodIconDataUrl(entry.mood),
    entry.weather ? getWeatherIconDataUrl(entry.weather) : Promise.resolve(WEATHER_UNSELECTED_LABEL),
  ]);

  return {
    title: entry.title,
    text: entry.content,
    mood: moodImage,
    weather: weatherValue,
    image: entry.images.length > 0 ? entry.images : null,
    created_at: toLocalWallClockTimestamp(entry.createdAt),
    mood_key: entry.mood,
    weather_key: entry.weather,
  };
}

/** "시간을 붙잡다"(DiaryWriteForm)에서 저장할 때, Supabase의 "글 읽기 리스트"
 * (memory_entries) 테이블에 한 행을 추가하고, 같은 내용을 "날짜별 목록
 * 리스트"(date_list)와 "달력 검색 리스트"(calendar_search_list)에도
 * memory_entries_id로 연결해 함께 추가합니다.
 *
 * memory_entries.id는 자동 증가 값이라 이 앱의 entry.id(uuid)와 연결할 컬럼이
 * 없습니다 — 그래서 새 글을 쓸 때만 이 함수를 쓰고, 이미 Supabase에 있는 글을
 * 고치는 경우엔 updateMemoryEntry를 씁니다. */
export async function insertMemoryEntry(entry: DiaryEntry): Promise<boolean> {
  const supabase = createClient();
  const {
    title,
    text,
    mood: moodImage,
    weather: weatherValue,
    image: images,
    created_at: createdAt,
    mood_key: moodKey,
    weather_key: weatherKey,
  } = await encodeEntryFields(entry);

  const { data, error } = await supabase
    .from("memory_entries")
    .insert({
      title,
      text,
      mood: moodImage,
      weather: weatherValue,
      image: images,
      created_at: createdAt,
      mood_key: moodKey,
      weather_key: weatherKey,
    })
    .select("id")
    .single();

  if (error) {
    console.error("memory_entries 저장 실패", error);
    return false;
  }

  // "날짜별 목록 리스트"(date_list)에도 글 읽기 리스트(memory_entries)의 같은
  // 값을 그대로 복사해 추가하고, memory_entries_id로 방금 추가한 행을
  // 참조하게 합니다.
  const { error: dateListError } = await supabase.from("date_list").insert({
    date_title: entry.title,
    date_mood: moodImage,
    date_weather: weatherValue,
    date_image: images,
    date_at: createdAt,
    date_mood_key: moodKey,
    date_weather_key: weatherKey,
    memory_entries_id: data.id,
  });

  if (dateListError) {
    console.error("date_list 저장 실패", dateListError);
    return false;
  }

  // "달력 검색 리스트"(calendar_search_list)에도 마찬가지로 글 읽기 리스트
  // (memory_entries)의 같은 값을 복사해 추가합니다(이 테이블엔 title 컬럼이
  // 없어 mood/weather/image/created_at만 참조합니다).
  const { error: calendarListError } = await supabase.from("calendar_search_list").insert({
    calendar_mood: moodImage,
    calendar_weather: weatherValue,
    calendar_image: images,
    calendar_at: createdAt,
    calendar_mood_key: moodKey,
    calendar_weather_key: weatherKey,
    memory_entries_id: data.id,
  });

  if (calendarListError) {
    console.error("calendar_search_list 저장 실패", calendarListError);
    return false;
  }

  // 이 글의 로컬 id로 Supabase에 다시 조회했을 때 나올 id를 기록해 둡니다
  // (useMemoryEntries가 중복 표시를 막는 데 씁니다).
  syncedRemoteIds.set(entry.id, `${REMOTE_ID_PREFIX}${data.id}`);
  return true;
}

/** 이미 Supabase에 저장된 글("mem-<bigint>" id)을 "시간을 붙잡다"에서 다시
 * 고쳐 저장할 때 씁니다. memory_entries 행을 갱신하고, memory_entries_id로
 * 연결된 date_list/calendar_search_list 행도 같은 값으로 함께 갱신합니다.
 * mood_key/weather_key 컬럼 덕분에 수정 화면을 다시 열어도 원래 기분/날씨
 * 선택이 그대로 복원됩니다(rowToEntry 참고). */
export async function updateMemoryEntry(entryId: string, entry: DiaryEntry): Promise<boolean> {
  if (!isRemoteEntryId(entryId)) return false;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return false;

  const supabase = createClient();
  const {
    title,
    text,
    mood: moodImage,
    weather: weatherValue,
    image: images,
    created_at: createdAt,
    mood_key: moodKey,
    weather_key: weatherKey,
  } = await encodeEntryFields(entry);

  const { error } = await supabase
    .from("memory_entries")
    .update({
      title,
      text,
      mood: moodImage,
      weather: weatherValue,
      image: images,
      created_at: createdAt,
      mood_key: moodKey,
      weather_key: weatherKey,
    })
    .eq("id", numericId);

  if (error) {
    console.error("memory_entries 수정 실패", error);
    return false;
  }

  const { error: dateListError } = await supabase
    .from("date_list")
    .update({
      date_title: title,
      date_mood: moodImage,
      date_weather: weatherValue,
      date_image: images,
      date_at: createdAt,
      date_mood_key: moodKey,
      date_weather_key: weatherKey,
    })
    .eq("memory_entries_id", numericId);

  if (dateListError) {
    console.error("date_list 수정 실패", dateListError);
    return false;
  }

  const { error: calendarListError } = await supabase
    .from("calendar_search_list")
    .update({
      calendar_mood: moodImage,
      calendar_weather: weatherValue,
      calendar_image: images,
      calendar_at: createdAt,
      calendar_mood_key: moodKey,
      calendar_weather_key: weatherKey,
    })
    .eq("memory_entries_id", numericId);

  if (calendarListError) {
    console.error("calendar_search_list 수정 실패", calendarListError);
    return false;
  }

  syncedRemoteIds.set(entryId, entryId);
  return true;
}

/** Supabase에 저장된 글("mem-<bigint>" id)을 삭제합니다. date_list/
 * calendar_search_list는 memory_entries_id가 ON DELETE SET NULL로 걸려있어
 * (별도 요구사항) 그 행 자체는 남고 참조만 비워집니다 — 여기서 따로 지우지
 * 않습니다. */
export async function deleteMemoryEntry(entryId: string): Promise<boolean> {
  if (!isRemoteEntryId(entryId)) return false;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return false;

  const supabase = createClient();
  const { error } = await supabase.from("memory_entries").delete().eq("id", numericId);

  if (error) {
    console.error("memory_entries 삭제 실패", error);
    return false;
  }

  // 이 원격 id를 가리키던 매핑이 남아있다면 함께 정리합니다.
  for (const [localId, remoteId] of syncedRemoteIds) {
    if (remoteId === entryId) syncedRemoteIds.delete(localId);
  }
  return true;
}

/** 로컬 id로 저장한 글이 이번 세션에 Supabase에도 반영됐다면 그 원격 id를
 * 돌려줍니다(없으면 undefined). "기억의 날개"(내보내기 후 삭제) 등, 로컬
 * 목록만 다루는 화면에서 Supabase 쪽도 함께 지워야 할 때 씁니다. */
export function getSyncedRemoteId(localId: string): string | undefined {
  return syncedRemoteIds.get(localId);
}

/** 글 하나를 "어디에 저장돼 있든" 지웁니다 — 로컬 세션 저장소, 그리고 (원격
 * 글이거나 이번 세션에 Supabase로도 동기화된 로컬 글이면) Supabase까지 함께
 * 지웁니다. 여러 화면(상세 보기, 수정 화면, 내보내기 후 삭제)이 이 함수 하나로
 * 삭제 로직을 통일해 씁니다 — 그렇지 않으면 로컬만 지우고 Supabase엔 그대로
 * 남는 문제가 반복해서 나타났습니다(실제로 겪은 문제: 내보내기 후 삭제해도
 * "그날을 거닐다"엔 Supabase 사본이 그대로 보임). */
export async function deleteDiaryEntryEverywhere(id: string): Promise<void> {
  removeSavedDiaryEntry(id);
  const remoteId = isRemoteEntryId(id) ? id : getSyncedRemoteId(id);
  if (remoteId) await deleteMemoryEntry(remoteId);
}

/** Supabase에 저장된 글을 전부 지웁니다("기억의 소멸" — 데이터 전체 초기화용).
 * memory_entries뿐 아니라 date_list/calendar_search_list도 함께 비웁니다 —
 * memory_entries만 지우면 그 두 테이블은 ON DELETE SET NULL로 참조만 비워질
 * 뿐 행 자체는 남아 완전한 초기화가 되지 않습니다. */
export async function clearAllRemoteDiaryData(): Promise<boolean> {
  const supabase = createClient();
  const [dateListResult, calendarListResult, memoryEntriesResult] = await Promise.all([
    supabase.from("date_list").delete().gte("id", 0),
    supabase.from("calendar_search_list").delete().gte("id", 0),
    supabase.from("memory_entries").delete().gte("id", 0),
  ]);

  const error = dateListResult.error ?? calendarListResult.error ?? memoryEntriesResult.error;
  if (error) {
    console.error("Supabase 데이터 초기화 실패", error);
    return false;
  }
  syncedRemoteIds.clear();
  return true;
}

/** 목록/달력에 쓸 글 전체를 최신순으로 불러옵니다. 본문(text)은 목록에
 * 표시하지 않아 대역폭을 아끼기 위해 조회에서 뺍니다(상세 조회는
 * fetchMemoryEntryById가 따로 담당). */
export async function fetchMemoryEntries(): Promise<DiaryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, mood, weather, image, created_at, mood_key, weather_key")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("memory_entries 조회 실패", error);
    return [];
  }
  return (data ?? []).map(rowToEntry);
}

/** id 하나로 memory_entries에서 글 하나를 불러옵니다. entryId가 "mem-"로
 * 시작하지 않으면(로컬 글이면) 곧바로 null을 반환합니다. */
export async function fetchMemoryEntryById(entryId: string): Promise<DiaryEntry | null> {
  if (!entryId.startsWith(REMOTE_ID_PREFIX)) return null;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, text, mood, weather, image, created_at, mood_key, weather_key")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("memory_entries 단건 조회 실패", error);
    return null;
  }
  return data ? rowToEntry(data) : null;
}

/** remoteEntries(Supabase에서 읽어온 목록) 중, 이번 세션에 로컬 저장→Supabase
 * 동기화까지 이미 끝난 글의 원격 사본을 걸러냅니다. localEntries(현재 화면에
 * 함께 보여줄 로컬 저장 목록)에 그 로컬 항목이 여전히 남아있는 동안만 걸러내며,
 * 그렇지 않으면(예: 새로고침으로 로컬 상태가 사라진 뒤) 원격 사본을 그대로
 * 보여줍니다.
 *
 * "그날을 거닐다"/달력 모달은 Server Component(fetchMemoryEntriesServer)가
 * 매 진입마다 새로 목록을 가져오는데, 그 시점에 방금 저장한 글이 이미
 * Supabase에도 반영돼 있으면 로컬 항목과 id가 달라(로컬 uuid vs "mem-<id>")
 * 단순 id 비교로는 중복을 걸러낼 수 없습니다(실제로 겪은 문제: 글 저장 직후
 * 목록에 같은 글이 두 번 보임 — 새로고침하면 로컬 상태가 사라지며 정상으로
 * 돌아옴). syncedRemoteIds가 그 로컬→원격 id 매핑을 들고 있어 이걸로 걸러냅니다. */
export function suppressSyncedDuplicates(
  remoteEntries: DiaryEntry[],
  localEntries: DiaryEntry[]
): DiaryEntry[] {
  if (syncedRemoteIds.size === 0) return remoteEntries;

  const activeLocalIds = new Set(localEntries.map((localEntry) => localEntry.id));
  const suppressedRemoteIds = new Set(
    Array.from(syncedRemoteIds.entries())
      .filter(([localId]) => activeLocalIds.has(localId))
      .map(([, remoteId]) => remoteId)
  );
  if (suppressedRemoteIds.size === 0) return remoteEntries;

  return remoteEntries.filter((entry) => !suppressedRemoteIds.has(entry.id));
}

interface UseMemoryEntriesResult {
  entries: DiaryEntry[];
  /** Supabase 조회가 아직 끝나지 않은 상태. 새로고침 직후엔 이 값이 true인
   * 동안 entries가 잠깐 빈 배열이니, 화면에서 이걸 "데이터가 없다"로 보여주면
   * 방금까지 있던 글이 사라졌다가 다시 생기는 것처럼 보입니다(실제로 겪은
   * 문제) — 목록 화면은 loading 동안 빈 상태 대신 로딩 표시를 보여줘야 합니다. */
  loading: boolean;
}

/** "그날을 거닐다"/달력 화면이 새로고침 후에도 비어 보이지 않도록, 마운트 시
 * Supabase에서 글 목록을 한 번 불러옵니다. 같은 세션 안에서 새로 저장한
 * 글은 useSavedDiaryEntries(로컬)가 즉시 반영하므로, 저장할 때마다 다시
 * 불러올 필요는 없습니다.
 *
 * localEntries(useSavedDiaryEntries 결과)를 함께 받아, 저장 직후 이미
 * 로컬에 반영된 글이 이 화면이 나중에(다시 마운트되며) Supabase에서 같은
 * 글을 또 불러와 두 번 보이는 것을 막습니다 — 로컬 항목이 아직 화면에
 * 남아있는 동안만 그 글의 원격 사본을 걸러냅니다. */
export function useMemoryEntries(localEntries: DiaryEntry[]): UseMemoryEntriesResult {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMemoryEntries().then((fetched) => {
      if (cancelled) return;
      setEntries(fetched);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { entries: suppressSyncedDuplicates(entries, localEntries), loading };
}

/** id가 이 앱에서 만든 로컬(uuid) id가 아니라 Supabase에서 읽어온 글의
 * id("mem-<bigint>")인지 확인합니다. */
export function isRemoteEntryId(id: string | null | undefined): boolean {
  return !!id && id.startsWith(REMOTE_ID_PREFIX);
}

interface UseRemoteMemoryEntryResult {
  entry: DiaryEntry | null;
  /** id가 원격 id인데 아직 조회 결과가 오지 않은 상태. 이 동안은 "찾을 수
   * 없음"으로 단정하면 안 됩니다(DiaryEntryDetail 참고). */
  loading: boolean;
}

/** id가 "mem-"로 시작하는 Supabase 글 하나를 불러옵니다. 로컬에서 찾은
 * 경우엔 호출부에서 id 대신 null/undefined를 넘겨 불필요한 조회를 막습니다
 * (DiaryEntryDetail 참고). */
export function useRemoteMemoryEntry(id: string | null | undefined): UseRemoteMemoryEntryResult {
  const remoteId = isRemoteEntryId(id) ? (id as string) : null;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  // 마지막으로 조회를 마친 id. remoteId와 다르면 아직 그 id의 결과를 기다리는
  // 중이라는 뜻이라 loading 여부를 여기서 판단합니다.
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!remoteId) return;
    let cancelled = false;
    fetchMemoryEntryById(remoteId).then((fetched) => {
      if (cancelled) return;
      setEntry(fetched);
      setLoadedForId(remoteId);
    });
    return () => {
      cancelled = true;
    };
  }, [remoteId]);

  if (!remoteId) return { entry: null, loading: false };
  const loading = loadedForId !== remoteId;
  return { entry: loading ? null : entry, loading };
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { removeSavedDiaryEntry } from "@/lib/savedDiaryEntries";
import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";
import { REMOTE_ID_PREFIX, rowToEntry } from "@/lib/memoryEntriesShared";

type SupabaseClient = ReturnType<typeof createClient>;

// 첨부 이미지를 담는 Storage 버킷. 공개 버킷이라 업로드 후 받은 공개 URL을
// memory_entries.image 컬럼에 그대로 저장해두면 만료 없이 계속 동작합니다
// (예전엔 이 컬럼에 base64 데이터를 통째로 직접 저장했습니다 — Postgres 행
// 용량/백업 부담을 줄이려고 Storage로 옮겼습니다). 이 앱은 로그인이 없어
// 폴더 이름으로 memory_entries.id(문자열)를 그대로 씁니다 — 글 하나당 폴더
// 하나, 그 안에 0.jpg / 1.jpg ... 순으로 최대 MAX_IMAGES(5)장.
const DIARY_IMAGES_BUCKET = "diary-images";

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

/** 이 폴더(글 하나) 아래 남아있는 첨부 이미지를 전부 지웁니다. 수정 저장(다시
 * 업로드하기 전 이전 파일 정리)과 글 삭제, 전체 초기화에서 공통으로 씁니다.
 * 실패해도(네트워크 오류 등) throw하지 않습니다 — Storage 정리는 부가 작업일
 * 뿐이라, 여기서 실패했다고 더 중요한 DB 삭제/수정 자체를 막으면 안 됩니다. */
async function clearEntryImages(supabase: SupabaseClient, folderKey: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(DIARY_IMAGES_BUCKET)
    .list(folderKey);
  if (listError) {
    console.error("첨부 이미지 목록 조회 실패", listError);
    return;
  }
  if (!files || files.length === 0) return;

  const { error: removeError } = await supabase.storage
    .from(DIARY_IMAGES_BUCKET)
    .remove(files.map((file) => `${folderKey}/${file.name}`));
  if (removeError) {
    console.error("첨부 이미지 삭제 실패", removeError);
  }
}

/** entry.images(리사이즈된 data URL 목록)를 이 글의 Storage 폴더에 업로드하고,
 * 공개 URL 목록을 돌려줍니다(첨부가 없으면 null). 하나라도 업로드에 실패하면
 * 예외를 던집니다 — 일부만 올라간 채로 DB에 반영되면 이미지가 빠진 글이
 * 저장되므로, 호출부(insertMemoryEntry/updateMemoryEntry)가 catch해서 실패
 * 처리합니다. */
async function uploadEntryImages(
  supabase: SupabaseClient,
  folderKey: string,
  images: string[]
): Promise<string[] | null> {
  if (images.length === 0) return null;

  const urls: string[] = [];
  for (let index = 0; index < images.length; index += 1) {
    const blob = await (await fetch(images[index])).blob();
    const path = `${folderKey}/${index}.jpg`;
    const { error } = await supabase.storage
      .from(DIARY_IMAGES_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from(DIARY_IMAGES_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

interface EncodedEntryFields {
  title: string;
  text: string;
  /** 목록/달력 조회가 image 컬럼 없이도 첨부 여부를 알 수 있도록 별도로
   * 저장해두는 값(lib/memoryEntriesShared.ts의 rowToEntry 참고). */
  has_attachment: boolean;
  created_at: string;
  mood_key: MoodKey;
  weather_key: WeatherKey | null;
}

/** insertMemoryEntry/updateMemoryEntry가 공통으로 쓰는 컬럼 값 인코딩(첨부
 * 이미지 제외 — Storage 업로드가 필요해 각자 별도로 처리합니다). mood_key/
 * weather_key에는 실제 선택된 키(예: "smile", "rain")를 그대로 저장합니다 —
 * 예전엔 mood/weather 컬럼에 아이콘 이미지(data URL)까지 통째로 중복 저장했지만,
 * 화면은 애초에 이 키만 보고 MOOD_ICONS/WEATHER_ICONS로 그리므로 그 컬럼은
 * 스키마에서 제거했습니다. */
function encodeEntryFields(entry: DiaryEntry): EncodedEntryFields {
  return {
    title: entry.title,
    text: entry.content,
    has_attachment: entry.hasAttachment,
    created_at: toLocalWallClockTimestamp(entry.createdAt),
    mood_key: entry.mood,
    weather_key: entry.weather,
  };
}

/** "시간을 붙잡다"(DiaryWriteForm)에서 저장할 때, Supabase의 "글 읽기 리스트"
 * (memory_entries) 테이블에 한 행을 추가합니다.
 *
 * memory_entries.id는 자동 증가 값이라 이 앱의 entry.id(uuid)와 연결할 컬럼이
 * 없습니다 — 그래서 새 글을 쓸 때만 이 함수를 쓰고, 이미 Supabase에 있는 글을
 * 고치는 경우엔 updateMemoryEntry를 씁니다.
 *
 * 첨부 이미지는 Storage 폴더 이름으로 이 행의 id(자동 증가값)를 써야 해서,
 * 행을 먼저 만들고 그 id로 이미지를 올린 뒤 image 컬럼만 다시 갱신하는
 * 순서로 진행합니다. */
export async function insertMemoryEntry(entry: DiaryEntry): Promise<boolean> {
  const supabase = createClient();
  const { title, text, has_attachment: hasAttachment, created_at: createdAt, mood_key: moodKey, weather_key: weatherKey } =
    encodeEntryFields(entry);

  const { data, error } = await supabase
    .from("memory_entries")
    .insert({
      title,
      text,
      image: null,
      has_attachment: hasAttachment,
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

  if (entry.images.length > 0) {
    try {
      const imageUrls = await uploadEntryImages(supabase, String(data.id), entry.images);
      const { error: imageError } = await supabase
        .from("memory_entries")
        .update({ image: imageUrls })
        .eq("id", data.id);
      if (imageError) console.error("첨부 이미지 URL 저장 실패", imageError);
    } catch (uploadError) {
      // 글 자체(텍스트/기분/날씨)는 이미 저장됐으니 실패로 되돌리지 않고,
      // 이미지만 빠진 채로 둡니다 — 콘솔에는 원인을 남깁니다.
      console.error("첨부 이미지 업로드 실패", uploadError);
    }
  }

  // 이 글의 로컬 id로 Supabase에 다시 조회했을 때 나올 id를 기록해 둡니다
  // (useMemoryEntries가 중복 표시를 막는 데 씁니다).
  syncedRemoteIds.set(entry.id, `${REMOTE_ID_PREFIX}${data.id}`);
  return true;
}

/** 이미 Supabase에 저장된 글("mem-<bigint>" id)을 "시간을 붙잡다"에서 다시
 * 고쳐 저장할 때 씁니다. mood_key/weather_key 컬럼 덕분에 수정 화면을 다시
 * 열어도 원래 기분/날씨 선택이 그대로 복원됩니다(rowToEntry 참고).
 *
 * 첨부 이미지는 이 글의 Storage 폴더를 통째로 비운 뒤 현재 첨부된 이미지를
 * 다시 올립니다 — 어떤 이미지가 빠졌는지 하나하나 비교하는 대신, 매번 비우고
 * 다시 채우는 편이 더 단순하고 이전 파일이 고아로 남는 일도 없습니다(최대
 * 5장이라 매번 다시 올려도 부담이 크지 않습니다). */
export async function updateMemoryEntry(entryId: string, entry: DiaryEntry): Promise<boolean> {
  if (!isRemoteEntryId(entryId)) return false;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return false;

  const supabase = createClient();
  const { title, text, has_attachment: hasAttachment, created_at: createdAt, mood_key: moodKey, weather_key: weatherKey } =
    encodeEntryFields(entry);

  const folderKey = String(numericId);
  await clearEntryImages(supabase, folderKey);

  let imageUrls: string[] | null = null;
  try {
    imageUrls = await uploadEntryImages(supabase, folderKey, entry.images);
  } catch (uploadError) {
    console.error("첨부 이미지 업로드 실패", uploadError);
  }

  const { error } = await supabase
    .from("memory_entries")
    .update({
      title,
      text,
      image: imageUrls,
      has_attachment: hasAttachment,
      created_at: createdAt,
      mood_key: moodKey,
      weather_key: weatherKey,
    })
    .eq("id", numericId);

  if (error) {
    console.error("memory_entries 수정 실패", error);
    return false;
  }

  syncedRemoteIds.set(entryId, entryId);
  return true;
}

/** Supabase에 저장된 글("mem-<bigint>" id)을 삭제합니다. Storage에 올려둔
 * 첨부 이미지도 함께 지워, 글은 지워졌는데 이미지 파일만 버킷에 고아로
 * 남는 일이 없게 합니다. */
export async function deleteMemoryEntry(entryId: string): Promise<boolean> {
  if (!isRemoteEntryId(entryId)) return false;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return false;

  const supabase = createClient();
  await clearEntryImages(supabase, String(numericId));

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
 * diary-images 버킷에 올려둔 첨부 이미지도 폴더(글 id)별로 모두 비웁니다. */
export async function clearAllRemoteDiaryData(): Promise<boolean> {
  const supabase = createClient();

  const { data: folders, error: listError } = await supabase.storage
    .from(DIARY_IMAGES_BUCKET)
    .list();
  if (listError) {
    console.error("첨부 이미지 폴더 목록 조회 실패", listError);
  } else if (folders) {
    await Promise.all(folders.map((folder) => clearEntryImages(supabase, folder.name)));
  }

  const { error } = await supabase.from("memory_entries").delete().gte("id", 0);

  if (error) {
    console.error("Supabase 데이터 초기화 실패", error);
    return false;
  }
  syncedRemoteIds.clear();
  return true;
}

/** 목록/달력에 쓸 글 전체를 최신순으로 불러옵니다. 본문(text)은 목록에
 * 표시하지 않아 대역폭을 아끼기 위해 조회에서 뺍니다(상세 조회는
 * fetchMemoryEntryById가 따로 담당). image(첨부 이미지 URL) 컬럼도 목록
 * 화면은 실제로 그리지 않고 "첨부 있음" 아이콘만 표시하므로, 그 여부만 담은
 * has_attachment만 가져오고 image는 select하지 않습니다 — 예전엔 image까지
 * 통째로 내려받아 목록/달력을 열 때마다 화면에 안 쓰는 이미지 데이터를
 * 불필요하게 전부 로드하고 있었습니다(실제로 겪은 문제). */
export async function fetchMemoryEntries(): Promise<DiaryEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, has_attachment, created_at, mood_key, weather_key")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("memory_entries 조회 실패", error);
    return [];
  }
  return (data ?? []).map(rowToEntry);
}

/** id 하나로 memory_entries에서 글 하나를 불러옵니다. entryId가 "mem-"로
 * 시작하지 않으면(로컬 글이면) 곧바로 null을 반환합니다. image 컬럼에는
 * Storage 공개 URL이 들어있어(예전의 base64 데이터 대신), 다른 로컬 글과
 * 마찬가지로 그대로 <img src>에 쓸 수 있습니다. */
export async function fetchMemoryEntryById(entryId: string): Promise<DiaryEntry | null> {
  if (!entryId.startsWith(REMOTE_ID_PREFIX)) return null;
  const numericId = Number(entryId.slice(REMOTE_ID_PREFIX.length));
  if (!Number.isFinite(numericId)) return null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, text, image, created_at, mood_key, weather_key")
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

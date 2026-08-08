"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { removeSavedDiaryEntry } from "@/lib/savedDiaryEntries";
import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";
import { REMOTE_ID_PREFIX, rowToEntry } from "@/lib/memoryEntriesShared";
import { onUserIdChange, useCurrentUserId } from "@/lib/authUserId";

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

// 이번 세션에서 삭제 처리한 원격 글의 id 집합. "그날을 거닐다"/달력은 Server
// Component가 내려준 스냅샷(entries prop)을 쓰는데, 브라우저 뒤로가기로 그
// 화면에 돌아오면 Next.js가 방금 지우기 전의 스냅샷을 그대로 재사용해 지운
// 글이 다시 보이는 문제가 있었습니다(실제로 겪은 문제 — 새로고침하면 정상
// 으로 돌아옴, 즉 서버 데이터는 이미 지워졌고 화면에 남은 스냅샷만 옛것).
// 삭제에 성공한 id를 여기 기록해두고, 어떤 경로로 그 글이 다시 내려와도
// (스냅샷이 새것이든 옛것이든) 걸러냅니다.
const deletedRemoteIds = new Set<string>();

// "기억의 소멸"로 한 번에 전부 지운 뒤에는, 어떤 id였는지 일일이 몰라도 그
// 시점 이후 서버가 내려주는 원격 글 스냅샷을 통째로 무시합니다 — 그 뒤에
// 새로 쓴 글은 로컬 저장소로 즉시 반영되니 영향이 없습니다.
let allRemoteDataCleared = false;

// 로그인한 계정이 실제로 바뀌면(로그아웃 후 다른 계정으로 로그인 등), 위
// 캐시들은 전부 이전 계정 기준이라 그대로 두면 다른 사용자의 글 id가 이번
// 계정에도 "이미 지워짐"/"이미 동기화됨"으로 잘못 걸러질 수 있습니다 —
// 계정이 바뀔 때마다 전부 비웁니다.
if (typeof window !== "undefined") {
  onUserIdChange(() => {
    syncedRemoteIds.clear();
    deletedRemoteIds.clear();
    allRemoteDataCleared = false;
  });
}

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
  /** 사용자가 "시간을 붙잡다"에서 고른 날짜 — created_at(실제 저장 시각)과는
   * 별개로 그대로 저장합니다(memoryEntriesShared.ts 참고). */
  entry_date: string;
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
    entry_date: entry.date,
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
  const {
    title,
    text,
    has_attachment: hasAttachment,
    created_at: createdAt,
    entry_date: entryDate,
    mood_key: moodKey,
    weather_key: weatherKey,
  } = encodeEntryFields(entry);

  // 글마다 작성자를 저장해둬야 사용자별로 데이터를 분리해서 불러올 수
  // 있습니다. user_id는 NOT NULL이라, 로그인 안 된 상태(정상 흐름상 일어나지
  // 않지만 방어적으로)면 저장 자체를 하지 않습니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("memory_entries 저장 실패: 로그인한 사용자를 확인할 수 없습니다.");
    return false;
  }

  const { data, error } = await supabase
    .from("memory_entries")
    .insert({
      title,
      text,
      image: null,
      has_attachment: hasAttachment,
      created_at: createdAt,
      entry_date: entryDate,
      // 처음 저장하는 글이라 아직 한 번도 고친 적이 없습니다 — updated_at은
      // updateMemoryEntry에서만 채워집니다.
      updated_at: null,
      mood_key: moodKey,
      weather_key: weatherKey,
      user_id: user.id,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // 이 행이 실제로 아직 남아있는지(그리고 내 글이 맞는지) 먼저 확인합니다 —
  // 이미 지워진 id나 다른 사용자의 글에 update()를 호출하면 Supabase는
  // 매칭되는 행이 없을 뿐 에러 없이 성공을 돌려줘("0행 갱신"도 성공으로
  // 취급), "내보내며 삭제" 옵션으로 Supabase 원본까지 지운 뒤 그 백업을
  // 다시 가져오면 화면(로컬 목록)엔 나타나는데 memory_entries 테이블에는
  // 전혀 반영되지 않는 문제가 있었습니다(실제로 겪은 문제 — 가져온 글의
  // id가 옛 원격 id 그대로 남아있어, insert 대신 update가 호출되고 그
  // update가 조용히 아무 행도 못 찾음). 존재하지 않으면(또는 내 글이
  // 아니면) 여기서 false를 돌려줘 호출부(DataRestorePanel)가
  // insertMemoryEntry로 새로 등록하도록 합니다.
  const { data: existing, error: existsError } = await supabase
    .from("memory_entries")
    .select("id")
    .eq("id", numericId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existsError) {
    console.error("memory_entries 존재 확인 실패", existsError);
    return false;
  }
  if (!existing) return false;

  const {
    title,
    text,
    has_attachment: hasAttachment,
    created_at: createdAt,
    entry_date: entryDate,
    mood_key: moodKey,
    weather_key: weatherKey,
  } = encodeEntryFields(entry);

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
      entry_date: entryDate,
      // 이 함수가 호출됐다는 것 자체가 "고쳐서 다시 저장"이라는 뜻이라, 호출
      // 시점을 그대로 최종 수정 시각으로 찍습니다(entry.updatedAt을 그대로
      // 믿는 대신 여기서 직접 stamping — DB에 남는 값이 항상 실제 저장
      // 시각과 일치하게 함).
      updated_at: toLocalWallClockTimestamp(new Date().toISOString()),
      mood_key: moodKey,
      weather_key: weatherKey,
    })
    .eq("id", numericId)
    .eq("user_id", user.id);

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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  // 내 글이 맞는지 먼저 확인합니다 — id만으로 지우면 다른 사용자의 글 id를
  // 알아내(순차 증가값이라 추측 가능) Storage 이미지까지 지워버릴 수
  // 있습니다.
  const { data: existing } = await supabase
    .from("memory_entries")
    .select("id")
    .eq("id", numericId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!existing) return false;

  await clearEntryImages(supabase, String(numericId));

  const { error } = await supabase
    .from("memory_entries")
    .delete()
    .eq("id", numericId)
    .eq("user_id", user.id);

  if (error) {
    console.error("memory_entries 삭제 실패", error);
    return false;
  }

  // 이 원격 id를 가리키던 매핑이 남아있다면 함께 정리합니다.
  for (const [localId, remoteId] of syncedRemoteIds) {
    if (remoteId === entryId) syncedRemoteIds.delete(localId);
  }
  // 이후 어떤 스냅샷에 이 id가 다시 섞여 들어와도 걸러내도록 기록합니다
  // (suppressDeletedEntries 참고).
  deletedRemoteIds.add(entryId);
  return true;
}

/** 로컬 id로 저장한 글이 이번 세션에 Supabase에도 반영됐다면 그 원격 id를
 * 돌려줍니다(없으면 undefined). "기억의 날개"(내보내기 후 삭제) 등, 로컬
 * 목록만 다루는 화면에서 Supabase 쪽도 함께 지워야 할 때 씁니다. */
export function getSyncedRemoteId(localId: string): string | undefined {
  return syncedRemoteIds.get(localId);
}

/** 로컬 저장소에 남은 글의 id를 임시 uuid에서 원격 id로 바꿔치기(단
 * updateSavedDiaryEntryId 참고)한 직후 호출합니다. syncedRemoteIds는 "로컬 id
 * → 원격 id" 매핑인데, 이 바꿔치기로 로컬 저장소에는 더 이상 옛 uuid가 아니라
 * 원격 id 자체가 남으므로, 그 옛 매핑(uuid → mem-<n>)으로는
 * suppressSyncedDuplicates가 더 이상 로컬 항목을 찾지 못해 Supabase 조회
 * 결과의 같은 글을 걸러내지 못합니다 — 로컬·원격 두 항목이 같은 id로 함께
 * 남아 목록에 중복으로 뜨고, React가 "두 자식이 같은 key를 가짐" 경고를
 * 냅니다(실제로 겪은 문제). updateMemoryEntry(수정 저장)가 이미 쓰는 것과
 * 같은 자기 자신 매핑(mem-<n> → mem-<n>)을 여기서도 추가해 이 경우를 마저
 * 덮습니다. */
export function confirmSyncedRemoteId(remoteId: string): void {
  syncedRemoteIds.set(remoteId, remoteId);
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

/** 로그인한 사용자 본인의 Supabase 글을 전부 지웁니다("기억의 소멸" — 데이터
 * 전체 초기화용). diary-images 버킷에 올려둔 첨부 이미지도 그 글들의
 * 폴더(글 id)별로 모두 비웁니다.
 *
 * 예전엔 버킷 전체를 나열해 통째로 비우고 테이블도 조건 없이(gte("id", 0))
 * 전부 지웠는데, 이제 글마다 작성자가 구분되므로 그렇게 하면 다른 사용자의
 * 글/이미지까지 함께 지워버립니다 — 반드시 내 글로만 좁혀야 합니다. */
export async function clearAllRemoteDiaryData(): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: myEntries, error: listEntriesError } = await supabase
    .from("memory_entries")
    .select("id")
    .eq("user_id", user.id);
  if (listEntriesError) {
    console.error("memory_entries 목록 조회 실패", listEntriesError);
    return false;
  }

  await Promise.all(
    (myEntries ?? []).map((entry) => clearEntryImages(supabase, String(entry.id)))
  );

  const { error } = await supabase.from("memory_entries").delete().eq("user_id", user.id);

  if (error) {
    console.error("Supabase 데이터 초기화 실패", error);
    return false;
  }
  syncedRemoteIds.clear();
  deletedRemoteIds.clear();
  allRemoteDataCleared = true;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, has_attachment, created_at, entry_date, mood_key, weather_key")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("memory_entries 조회 실패", error);
    return [];
  }
  return (data ?? []).map(rowToEntry);
}

/** "기억의 날개"(내보내기)/"기억의 귀환"(가져오기)처럼 실제 본문·첨부까지
 * 전부 있어야 하는 화면을 위한 전체 글 조회. fetchMemoryEntries(목록/달력용)와
 * 똑같이 전체 글을 최신순으로 가져오되, text/image 컬럼까지 함께 select합니다.
 *
 * 예전엔 내보내기도 fetchMemoryEntries(목록 조회)를 그대로 재사용했는데, 그
 * 결과에는 text/image가 아예 없어(row.text가 undefined → rowToEntry가 ""로
 * 채움) 로컬 세션에 없는(새로고침 이후 Supabase에만 남아있는) 글을 내보내면
 * 본문·첨부가 통째로 빈 채로 백업 파일에 담겼고, 그 백업을 나중에 다시
 * 가져오면 Supabase의 원래 글까지 빈 본문으로 덮어써지는 심각한 데이터 유실
 * 문제가 있었습니다(실제로 겪은 문제 — Supabase text 컬럼이 비어있는 것으로
 * 확인함). */
export async function fetchMemoryEntriesFull(): Promise<DiaryEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, text, image, created_at, entry_date, updated_at, mood_key, weather_key")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("memory_entries 전체(본문 포함) 조회 실패", error);
    return [];
  }
  return (data ?? []).map(rowToEntry);
}

/** remoteEntries(Server Component 스냅샷 또는 useMemoryEntries 조회 결과)에서
 * 이번 세션에 이미 삭제 처리한 글을 걸러냅니다. "그날을 거닐다"/달력은 Server
 * Component가 내려준 스냅샷을 그대로 쓰는데, 브라우저 뒤로가기로 그 화면에
 * 돌아오면 Next.js가 방금 지우기 전의(오래된) 스냅샷을 재사용해 지운 글이
 * 다시 보이는 문제가 있었습니다(실제로 겪은 문제 — 새로고침하면 정상으로
 * 돌아옴). 스냅샷이 새것이든 옛것이든 이 세션에서 지운 적 있는 id는 항상
 * 걸러내 화면에 다시 나타나지 않게 합니다. */
export function suppressDeletedEntries(remoteEntries: DiaryEntry[]): DiaryEntry[] {
  if (allRemoteDataCleared) return [];
  if (deletedRemoteIds.size === 0) return remoteEntries;
  return remoteEntries.filter((entry) => !deletedRemoteIds.has(entry.id));
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("memory_entries")
    .select("id, title, text, image, created_at, entry_date, updated_at, mood_key, weather_key")
    .eq("id", numericId)
    .eq("user_id", user.id)
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

/** useMemoryEntries/useMemoryEntriesFull이 공유하는 실제 구현. 어떤 조회
 * 함수(fetcher)를 쓰느냐만 다르고, 로딩 상태 관리와 "이미 로컬에 반영된
 * 글의 원격 사본 숨기기/삭제된 글 걸러내기"는 동일합니다. */
function useMemoryEntriesWith(
  fetcher: () => Promise<DiaryEntry[]>,
  localEntries: DiaryEntry[]
): UseMemoryEntriesResult {
  // 로그인한 계정이 바뀌면(로그아웃 후 다른 계정으로 로그인 등) 이전 계정
  // 기준으로 불러온 목록이 남아있으면 안 되므로, userId를 의존성에 넣어
  // 계정이 바뀔 때마다 처음부터 다시 불러옵니다.
  const userId = useCurrentUserId();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  // 마지막으로 fetcher 결과를 반영한 시점의 userId를 기록해뒀다가 현재
  // userId와 비교하는 것으로 loading 여부를 판단합니다 — effect 안에서
  // setLoading(true)를 동기 호출하지 않기 위함입니다(react-hooks 린트 규칙:
  // effect 본문에서 곧바로 setState하면 안 됨).
  const [loadedFor, setLoadedFor] = useState<{ userId: typeof userId } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((fetched) => {
      if (cancelled) return;
      setEntries(fetched);
      setLoadedFor({ userId });
    });
    return () => {
      cancelled = true;
    };
    // fetcher는 모듈 top-level 함수(fetchMemoryEntries/fetchMemoryEntriesFull)라
    // 참조가 항상 안정적이라 deps에서 뺍니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loading = loadedFor === null || loadedFor.userId !== userId;

  return {
    entries: loading
      ? []
      : suppressDeletedEntries(suppressSyncedDuplicates(entries, localEntries)),
    loading,
  };
}

/** "그날을 거닐다"/달력 화면이 새로고침 후에도 비어 보이지 않도록, 마운트 시
 * Supabase에서 글 목록을 한 번 불러옵니다. 같은 세션 안에서 새로 저장한
 * 글은 useSavedDiaryEntries(로컬)가 즉시 반영하므로, 저장할 때마다 다시
 * 불러올 필요는 없습니다.
 *
 * localEntries(useSavedDiaryEntries 결과)를 함께 받아, 저장 직후 이미
 * 로컬에 반영된 글이 이 화면이 나중에(다시 마운트되며) Supabase에서 같은
 * 글을 또 불러와 두 번 보이는 것을 막습니다 — 로컬 항목이 아직 화면에
 * 남아있는 동안만 그 글의 원격 사본을 걸러냅니다.
 *
 * 목록/달력처럼 본문을 화면에 그리지 않는 곳에서만 씁니다 — 본문/첨부까지
 * 필요하면(내보내기/가져오기) useMemoryEntriesFull을 대신 쓰세요. */
export function useMemoryEntries(localEntries: DiaryEntry[]): UseMemoryEntriesResult {
  return useMemoryEntriesWith(fetchMemoryEntries, localEntries);
}

/** useMemoryEntries와 동일하지만 본문(text)/첨부(image)까지 포함해 불러옵니다
 * (fetchMemoryEntriesFull 참고) — "기억의 날개"(내보내기)/"기억의 귀환"
 * (가져오기)처럼 실제 데이터 전체가 필요한 화면에서 씁니다. */
export function useMemoryEntriesFull(localEntries: DiaryEntry[]): UseMemoryEntriesResult {
  return useMemoryEntriesWith(fetchMemoryEntriesFull, localEntries);
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
  // 계정이 바뀌면(드문 경우지만, 상세 화면을 띄운 채로 로그아웃 후 다른
  // 계정으로 로그인) 이전 계정 기준으로 불러온 글이 남아있지 않도록 다시
  // 불러옵니다 — fetchMemoryEntryById 자체도 매번 현재 사용자 소유인지 다시
  // 확인하지만, userId가 안 바뀌면 effect가 재실행되지 않아 화면이 갱신되지
  // 않습니다.
  const userId = useCurrentUserId();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  // 마지막으로 조회를 마친 (id, userId) 조합. 둘 중 하나라도 다르면 아직 그
  // 조합의 결과를 기다리는 중이라는 뜻이라 loading 여부를 여기서 판단합니다
  // (effect 안에서 setState를 동기 호출하지 않기 위해, 별도 loading state
  // 대신 이 비교로 대신합니다).
  const [loadedFor, setLoadedFor] = useState<{ remoteId: string; userId: typeof userId } | null>(
    null
  );

  useEffect(() => {
    if (!remoteId) return;
    let cancelled = false;
    fetchMemoryEntryById(remoteId).then((fetched) => {
      if (cancelled) return;
      setEntry(fetched);
      setLoadedFor({ remoteId, userId });
    });
    return () => {
      cancelled = true;
    };
  }, [remoteId, userId]);

  if (!remoteId) return { entry: null, loading: false };
  const loading =
    loadedFor === null || loadedFor.remoteId !== remoteId || loadedFor.userId !== userId;
  return { entry: loading ? null : entry, loading };
}

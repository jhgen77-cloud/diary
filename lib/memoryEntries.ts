"use client";

import { createClient } from "@/utils/supabase/client";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  WEATHER_UNSELECTED_LABEL,
  type MoodKey,
  type WeatherKey,
} from "@/lib/diaryIcons";

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

/** "시간을 붙잡다"(DiaryWriteForm)에서 저장할 때, Supabase의 "글 읽기 리스트"
 * (memory_entries) 테이블에도 같은 내용을 한 행씩 추가합니다.
 *
 * memory_entries.id는 자동 증가 값이라 이 앱의 entry.id(uuid)와 연결할 컬럼이
 * 없습니다 — 그래서 수정 저장도 새 행으로 추가되며(덮어쓰기 아님), 삭제는 이
 * 테이블에 반영하지 않습니다(prompt.md 요구사항이 "저장" 시 추가하는 것까지만
 * 다룹니다). */
export async function insertMemoryEntry(entry: DiaryEntry): Promise<boolean> {
  const supabase = createClient();

  // mood 컬럼에는 파일명이 아니라 실제 png/jpeg 이미지(data URL)를 저장합니다.
  // weather 컬럼은 선택하지 않았으면 텍스트("[선택안함]"), 선택했으면 mood와
  // 같은 방식으로 실제 이미지(data URL)를 저장합니다.
  const [moodImage, weatherValue] = await Promise.all([
    getMoodIconDataUrl(entry.mood),
    entry.weather ? getWeatherIconDataUrl(entry.weather) : Promise.resolve(WEATHER_UNSELECTED_LABEL),
  ]);

  const { error } = await supabase.from("memory_entries").insert({
    title: entry.title,
    text: entry.content,
    mood: moodImage,
    weather: weatherValue,
    // image 컬럼은 text[]라 첨부한 이미지(최대 5장, MAX_IMAGES 기준)를 그대로
    // 배열로 저장합니다(첨부 없으면 null).
    image: entry.images.length > 0 ? entry.images : null,
    created_at: toLocalWallClockTimestamp(entry.createdAt),
  });

  if (error) {
    console.error("memory_entries 저장 실패", error);
    return false;
  }
  return true;
}

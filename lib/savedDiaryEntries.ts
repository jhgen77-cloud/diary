"use client";

import { useSyncExternalStore } from "react";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

const STORAGE_KEY = "diary:savedEntries";
// 스키마 버전. 이전 버전으로 저장된(또는 개발 중 쌓인 임시) 데이터는 무시하고
// 빈 목록에서 다시 시작하려면 이 값을 올리면 됩니다.
// v2: DiaryEntry에 content/createdAt이 추가되어, 그 필드가 없던 이전 데이터를
// 걸러내기 위해 올렸습니다(상세 보기에서 "NaN년 ..." 오류가 나던 원인).
// v3: DiaryEntry에 images(첨부 이미지 data URL 목록)가 추가되었습니다.
const SCHEMA_VERSION = 3;

interface StoredPayload {
  v: number;
  entries: DiaryEntry[];
}

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSnapshot: DiaryEntry[] = [];

function isValidEntry(entry: unknown): entry is DiaryEntry {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Partial<DiaryEntry>;
  return (
    typeof e.id === "string" &&
    typeof e.date === "string" &&
    typeof e.title === "string" &&
    typeof e.content === "string" &&
    typeof e.createdAt === "string" &&
    !Number.isNaN(new Date(e.createdAt).getTime()) &&
    Array.isArray(e.images)
  );
}

function parse(raw: string | null): DiaryEntry[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as StoredPayload).v === SCHEMA_VERSION &&
      Array.isArray((parsed as StoredPayload).entries)
    ) {
      // 형식이 어긋난 항목(예: content/createdAt 누락)은 개별적으로 걸러냅니다.
      return (parsed as StoredPayload).entries.filter(isValidEntry);
    }
    // 버전이 다르거나(예전 형식 포함) 형태가 다르면 임시 데이터로 간주하고 비웁니다.
    return [];
  } catch {
    return [];
  }
}

function persist(entries: DiaryEntry[]) {
  const payload: StoredPayload = { v: SCHEMA_VERSION, entries };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    // 저장 용량 초과 등으로 실패해도 앱이 죽지 않도록 방어합니다.
    console.error("일기 저장 공간이 부족합니다.", error);
  }
}

function getSnapshot(): DiaryEntry[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

function getServerSnapshot(): DiaryEntry[] {
  return [];
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function notify() {
  cachedRaw = null; // 다음 getSnapshot 호출 때 강제로 다시 읽도록 캐시 무효화
  listeners.forEach((listener) => listener());
}

/** 새로 작성한(또는 같은 id로 덮어쓴) 일기를 브라우저에 로컬로 저장합니다. */
export function addSavedDiaryEntry(entry: DiaryEntry) {
  if (typeof window === "undefined") return;
  const existing = parse(window.localStorage.getItem(STORAGE_KEY));
  const next = [entry, ...existing.filter((e) => e.id !== entry.id)];
  persist(next);
  notify();
}

/** id가 일치하는 로컬 저장 일기를 제거합니다 (저장된 적 없는 id면 아무 일도 하지 않음). */
export function removeSavedDiaryEntry(id: string) {
  if (typeof window === "undefined") return;
  const existing = parse(window.localStorage.getItem(STORAGE_KEY));
  const next = existing.filter((e) => e.id !== id);
  if (next.length === existing.length) return; // 지울 게 없었음
  persist(next);
  notify();
}

/** 로컬에 저장된 일기를 전부 지웁니다 ('기억의 소멸' — 데이터 초기화). */
export function clearSavedDiaryEntries() {
  if (typeof window === "undefined") return;
  persist([]);
  notify();
}

/** 저장된 일기 목록 전체를 통째로 교체합니다 ('기억의 귀환' — 가져오기 병합 결과
 * 반영용). id 단위로만 add/remove하는 위 함수들과 달리, 같은 날짜의 일기를 다른
 * id의 항목으로 덮어써야 하는 가져오기 병합 결과를 그대로 반영할 수 있습니다. */
export function setSavedDiaryEntries(entries: DiaryEntry[]) {
  if (typeof window === "undefined") return;
  persist(entries);
  notify();
}

/** 로컬에 저장된 일기 목록을 구독합니다 (다른 탭에서의 변경도 반영됩니다). */
export function useSavedDiaryEntries(): DiaryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** id 하나에 해당하는 로컬 저장 일기를 구독합니다. 없으면 null. */
export function useSavedDiaryEntry(id: string | null | undefined): DiaryEntry | null {
  const entries = useSavedDiaryEntries();
  if (!id) return null;
  return entries.find((entry) => entry.id === id) ?? null;
}

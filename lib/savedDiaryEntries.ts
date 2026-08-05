"use client";

import { useSyncExternalStore } from "react";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

const STORAGE_KEY = "diary:savedEntries";
// 스키마 버전. 이전 버전으로 저장된(또는 개발 중 쌓인 임시) 데이터는 무시하고
// 빈 목록에서 다시 시작하려면 이 값을 올리면 됩니다.
const SCHEMA_VERSION = 1;

interface StoredPayload {
  v: number;
  entries: DiaryEntry[];
}

const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSnapshot: DiaryEntry[] = [];

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
      return (parsed as StoredPayload).entries;
    }
    // 버전이 다르거나(예전 형식 포함) 형태가 다르면 임시 데이터로 간주하고 비웁니다.
    return [];
  } catch {
    return [];
  }
}

function persist(entries: DiaryEntry[]) {
  const payload: StoredPayload = { v: SCHEMA_VERSION, entries };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
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

/** 로컬에 저장된 일기 목록을 구독합니다 (다른 탭에서의 변경도 반영됩니다). */
export function useSavedDiaryEntries(): DiaryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

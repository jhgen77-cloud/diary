"use client";

import { useSyncExternalStore } from "react";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

// Supabase 연동 전까지 쓰는 임시 저장소입니다. 예전에는 localStorage(키
// "diary:savedEntries")에 영속했지만, 지금은 탭 세션 동안만 유지되는 메모리
// 상태이며 새로고침하면 사라집니다 — Supabase 연동은 별도로 진행됩니다.
const OLD_STORAGE_KEY = "diary:savedEntries";

const listeners = new Set<() => void>();

// useSyncExternalStore는 getServerSnapshot/getSnapshot이 값이 바뀌지 않는 한
// 매번 같은 참조를 반환하길 요구합니다 — 호출마다 새 배열([])을 만들어
// 반환하면 "매번 값이 바뀐 것"으로 보여 무한 루프에 빠질 수 있어, 하나의
// 배열/변수를 재사용합니다.
const EMPTY_ENTRIES: DiaryEntry[] = [];

let entries: DiaryEntry[] = EMPTY_ENTRIES;

// 이전 버전에서 남아있을 수 있는 local storage 데이터를 한 번 지웁니다(이
// 모듈이 클라이언트에서 처음 로드될 때 1회 실행).
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {
    // 접근 자체가 막힌 환경(프라이빗 모드 등)이면 지울 것도 없으니 무시합니다.
  }
}

function getSnapshot(): DiaryEntry[] {
  return entries;
}

function getServerSnapshot(): DiaryEntry[] {
  return EMPTY_ENTRIES;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** 새로 작성한(또는 같은 id로 덮어쓴) 일기를 메모리에 저장합니다. */
export function addSavedDiaryEntry(entry: DiaryEntry) {
  if (typeof window === "undefined") return;
  entries = [entry, ...entries.filter((e) => e.id !== entry.id)];
  notify();
}

/** id가 일치하는 저장된 일기를 제거합니다 (저장된 적 없는 id면 아무 일도 하지 않음). */
export function removeSavedDiaryEntry(id: string) {
  if (typeof window === "undefined") return;
  const next = entries.filter((e) => e.id !== id);
  if (next.length === entries.length) return; // 지울 게 없었음
  entries = next;
  notify();
}

/** 저장된 일기를 전부 지웁니다 ('기억의 소멸' — 데이터 초기화). */
export function clearSavedDiaryEntries() {
  if (typeof window === "undefined") return;
  entries = EMPTY_ENTRIES;
  notify();
}

/** 저장된 일기 목록 전체를 통째로 교체합니다 ('기억의 귀환' — 가져오기 병합 결과
 * 반영용). id 단위로만 add/remove하는 위 함수들과 달리, 같은 날짜의 일기를 다른
 * id의 항목으로 덮어써야 하는 가져오기 병합 결과를 그대로 반영할 수 있습니다.
 *
 * 메모리에만 반영하므로 실패할 일이 없어 항상 true를 반환합니다(호출부인
 * DataRestorePanel의 "저장 공간 부족" 처리와의 호환을 위해 반환 형태는 유지). */
export function setSavedDiaryEntries(next: DiaryEntry[]): boolean {
  if (typeof window === "undefined") return false;
  entries = next;
  notify();
  return true;
}

/** 저장된 일기 목록을 구독합니다. */
export function useSavedDiaryEntries(): DiaryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** id 하나에 해당하는 저장된 일기를 구독합니다. 없으면 null. */
export function useSavedDiaryEntry(id: string | null | undefined): DiaryEntry | null {
  const entries = useSavedDiaryEntries();
  if (!id) return null;
  return entries.find((entry) => entry.id === id) ?? null;
}

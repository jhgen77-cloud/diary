"use client";

import { useSyncExternalStore } from "react";

/** 환경 설정(SettingsManager)이 쓰고, "시간을 붙잡다"(DiaryWriteForm)가 읽어서
 * 실제로 적용하는 공유 저장소. savedDiaryEntries.ts와 같은 패턴
 * (localStorage + useSyncExternalStore)을 그대로 씁니다 — 두 모달이 서로 다른
 * 라우트/컴포넌트 트리라 평범한 React state로는 값을 주고받을 수 없습니다. */

export type FontFamilyKey = "system" | "sans" | "serif" | "mono" | "handwriting";
export type TextAlignKey = "left" | "center" | "right" | "justify";
export type BackgroundType = "none" | "solid";

export interface EnvironmentSettings {
  fontFamily: FontFamilyKey;
  fontSize: number;
  fontColor: string;
  textAlign: TextAlignKey;
  backgroundType: BackgroundType;
  backgroundColor: string;
}

/** 저장된 일기 하나의 제목란에 적용된 스타일. 폰트크기·배경은 요구사항상 제목란엔
 * 적용되지 않아 여기엔 없습니다. */
export interface DiaryTitleStyle {
  fontFamily: FontFamilyKey;
  fontColor: string;
}

/** 저장된 일기 하나의 본문란에 적용된 스타일 — 본문은 다섯 항목 모두 적용됩니다. */
export interface DiaryContentStyle {
  fontFamily: FontFamilyKey;
  fontSize: number;
  fontColor: string;
  textAlign: TextAlignKey;
  backgroundType: BackgroundType;
  backgroundColor: string;
}

const STORAGE_KEY = "diary:environmentSettings";
const SCHEMA_VERSION = 1;

const DEFAULT_SETTINGS: EnvironmentSettings = {
  fontFamily: "system",
  fontSize: 16,
  fontColor: "#000000",
  textAlign: "left",
  backgroundType: "none",
  backgroundColor: "#ffffff",
};

interface StoredPayload {
  v: number;
  settings: EnvironmentSettings;
}

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedSnapshot: EnvironmentSettings = DEFAULT_SETTINGS;

function isValidSettings(value: unknown): value is EnvironmentSettings {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<EnvironmentSettings>;
  return (
    typeof v.fontFamily === "string" &&
    typeof v.fontSize === "number" &&
    typeof v.fontColor === "string" &&
    typeof v.textAlign === "string" &&
    typeof v.backgroundType === "string" &&
    typeof v.backgroundColor === "string"
  );
}

function parse(raw: string | null): EnvironmentSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      (parsed as StoredPayload).v === SCHEMA_VERSION &&
      isValidSettings((parsed as StoredPayload).settings)
    ) {
      return (parsed as StoredPayload).settings;
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persist(settings: EnvironmentSettings) {
  const payload: StoredPayload = { v: SCHEMA_VERSION, settings };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("환경 설정을 저장하지 못했습니다.", error);
  }
}

function getSnapshot(): EnvironmentSettings {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSnapshot = parse(raw);
  }
  return cachedSnapshot;
}

// DEFAULT_SETTINGS는 모듈 최상단에서 한 번만 만들어진 동일 참조입니다 — 매번
// 새 객체를 반환하면 useSyncExternalStore가 "getServerSnapshot should be
// cached" 경고와 함께 무한 루프에 빠질 수 있습니다(savedDiaryEntries.ts에서
// 실제로 겪었던 문제).
function getServerSnapshot(): EnvironmentSettings {
  return DEFAULT_SETTINGS;
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
  cachedRaw = null;
  listeners.forEach((listener) => listener());
}

/** 일부 값만 넘겨 갱신합니다(예: setEnvironmentSettings({ fontSize: 18 })). */
export function setEnvironmentSettings(update: Partial<EnvironmentSettings>) {
  if (typeof window === "undefined") return;
  const current = parse(window.localStorage.getItem(STORAGE_KEY));
  persist({ ...current, ...update });
  notify();
}

/** 현재 환경 설정을 구독합니다. 값이 바뀌면(다른 탭 포함) 리렌더링됩니다. */
export function useEnvironmentSettings(): EnvironmentSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

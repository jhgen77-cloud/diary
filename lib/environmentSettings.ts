"use client";

import { useSyncExternalStore } from "react";

/** 환경 설정(SettingsManager)이 쓰고, "시간을 붙잡다"(DiaryWriteForm)가 읽어서
 * 실제로 적용하는 공유 저장소. savedDiaryEntries.ts와 같은 패턴
 * (모듈 레벨 캐시 + useSyncExternalStore)을 그대로 씁니다 — 두 모달이 서로 다른
 * 라우트/컴포넌트 트리라 평범한 React state로는 값을 주고받을 수 없습니다.
 * Supabase 연동 전까지는 탭 세션 동안만 유지되는 메모리 상태입니다(예전에는
 * localStorage 키 "diary:environmentSettings"에 영속했습니다). */

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

const OLD_STORAGE_KEY = "diary:environmentSettings";

const DEFAULT_SETTINGS: EnvironmentSettings = {
  fontFamily: "system",
  fontSize: 16,
  fontColor: "#000000",
  textAlign: "left",
  backgroundType: "none",
  backgroundColor: "#ffffff",
};

const listeners = new Set<() => void>();

// DEFAULT_SETTINGS와 마찬가지로, 값이 바뀌지 않는 한 매번 같은 참조를
// 유지해야 useSyncExternalStore가 무한 루프에 빠지지 않습니다.
let settings: EnvironmentSettings = DEFAULT_SETTINGS;

// 이전 버전에서 남아있을 수 있는 local storage 데이터를 한 번 지웁니다(이
// 모듈이 클라이언트에서 처음 로드될 때 1회 실행).
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem(OLD_STORAGE_KEY);
  } catch {
    // 접근 자체가 막힌 환경(프라이빗 모드 등)이면 지울 것도 없으니 무시합니다.
  }
}

function getSnapshot(): EnvironmentSettings {
  return settings;
}

function getServerSnapshot(): EnvironmentSettings {
  return DEFAULT_SETTINGS;
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

/** 일부 값만 넘겨 갱신합니다(예: setEnvironmentSettings({ fontSize: 18 })). */
export function setEnvironmentSettings(update: Partial<EnvironmentSettings>) {
  if (typeof window === "undefined") return;
  settings = { ...settings, ...update };
  notify();
}

/** 현재 환경 설정을 구독합니다. 값이 바뀌면 리렌더링됩니다. */
export function useEnvironmentSettings(): EnvironmentSettings {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

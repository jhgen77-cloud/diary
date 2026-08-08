"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/utils/supabase/client";

// 현재 로그인한 사용자의 id를 앱 전역에서 공유하는 저장소입니다.
// undefined: 아직 최초 확인 전 / null: 로그인 안 됨 / string: 로그인된 사용자 id.
let currentUserId: string | null | undefined = undefined;
const listeners = new Set<() => void>();
// "계정이 실제로 바뀜"(로그인 → 다른 계정으로 로그인, 로그아웃 등)을 구독하는
// 콜백들 — 계정별로 쌓아둔 캐시를 들고 있는 다른 모듈(memoryEntries,
// savedDiaryEntries 등)이 이걸로 자기 캐시를 비웁니다. 최초 확인(undefined →
// 첫 값)은 "바뀜"으로 치지 않습니다.
const changeListeners = new Set<(userId: string | null) => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((_event, session) => {
    const nextId = session?.user?.id ?? null;
    if (nextId === currentUserId) return;
    const isRealChange = currentUserId !== undefined;
    currentUserId = nextId;
    notify();
    if (isRealChange) {
      changeListeners.forEach((listener) => listener(nextId));
    }
  });
}

function getSnapshot(): string | null | undefined {
  return currentUserId;
}

function getServerSnapshot(): string | null | undefined {
  return undefined;
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** 현재 로그인한 사용자의 id를 구독합니다. 값이 바뀌면(로그인/로그아웃/계정
 * 전환) 리렌더링됩니다 — Supabase 데이터를 불러오는 훅의 의존성으로 쓰면,
 * 계정이 바뀔 때마다 데이터를 처음부터 다시 불러오게 만들 수 있습니다. */
export function useCurrentUserId(): string | null | undefined {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** 로그인한 계정이 실제로 바뀔 때 호출할 콜백을 등록합니다(최초 로그인 확인은
 * 제외). 다른 사용자의 데이터/캐시가 화면에 섞여 남지 않도록, 계정별 상태를
 * 들고 있는 모듈이 이걸로 자기 상태를 초기화합니다. */
export function onUserIdChange(listener: (userId: string | null) => void): () => void {
  changeListeners.add(listener);
  return () => {
    changeListeners.delete(listener);
  };
}

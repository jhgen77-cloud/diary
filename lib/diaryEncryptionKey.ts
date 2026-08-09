"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createClient } from "@/utils/supabase/client";
import { onUserIdChange, useCurrentUserId } from "@/lib/authUserId";
import {
  checkVerifier,
  createVerifier,
  deriveKeyFromPassphrase,
  generateSalt,
} from "@/lib/diaryEncryption";

/** "일기 암호" 세션 상태를 들고 있는 모듈입니다. 로그인 비밀번호와는 별개로,
 * 사용자가 여기서 설정한 암호(passphrase)로 도출한 AES 키가 있어야 글의
 * 제목/본문/첨부 이미지를 암호화·복호화할 수 있습니다.
 *
 * unlockedKey(도출된 CryptoKey)는 세션 메모리(모듈 변수)에만 두고, 새로고침
 * 하면 사라집니다 — localStorage 등에 남기면 "서버(DB 관리자)는 못 봐도
 * 이 기기에 접근한 사람은 볼 수 있는" 절반짜리 보호가 되어버리므로 일부러
 * 영속시키지 않습니다. savedDiaryEntries.ts/environmentSettings.ts와 같은
 * (모듈 변수 + useSyncExternalStore) 패턴을 씁니다. */

interface EncryptionRow {
  salt: string;
  verifier: string;
  verifierIv: string;
}

let unlockedKey: CryptoKey | null = null;
const keyListeners = new Set<() => void>();

// 현재 로그인 사용자의 diary_encryption_keys 행 캐시. undefined=아직 조회 전,
// null=암호 미설정, 값 있음=설정됨(잠겨있을 수도 unlock돼 있을 수도).
let encryptionRow: EncryptionRow | null | undefined = undefined;
const rowListeners = new Set<() => void>();

function notifyKey() {
  keyListeners.forEach((listener) => listener());
}
function notifyRow() {
  rowListeners.forEach((listener) => listener());
}

// 계정이 실제로 바뀌면(로그아웃 후 다른 계정 로그인 등) 이전 계정의 키/행
// 캐시가 남아있으면 안 됩니다 — 다른 사용자 이름으로 암호화를 시도하거나,
// 이전 계정 기준 "설정됨" 상태가 잘못 보일 수 있습니다.
if (typeof window !== "undefined") {
  onUserIdChange(() => {
    unlockedKey = null;
    encryptionRow = undefined;
    notifyKey();
    notifyRow();
  });
}

function subscribeKey(listener: () => void) {
  keyListeners.add(listener);
  return () => keyListeners.delete(listener);
}
function getKeySnapshot() {
  return unlockedKey;
}
function getKeyServerSnapshot() {
  return null;
}

/** 훅이 아닌 일반 함수(lib/memoryEntries.ts의 insert/update 등)에서 현재
 * unlock된 키를 즉시 읽을 때 씁니다. 리렌더링에 반응해야 하는 컴포넌트는
 * 대신 useUnlockedKey를 쓰세요. */
export function getUnlockedKey(): CryptoKey | null {
  return unlockedKey;
}

/** 현재 unlock된 암호화 키를 구독합니다. null이면(암호 미설정이든, 설정은
 * 됐지만 이번 세션에 아직 입력 전이든) 암호화/복호화를 할 수 없는 상태입니다. */
export function useUnlockedKey(): CryptoKey | null {
  return useSyncExternalStore(subscribeKey, getKeySnapshot, getKeyServerSnapshot);
}

/** 세션에서만 키를 지웁니다("잠그기") — 서버 쪽 설정(salt/verifier)은 그대로라
 * 다음에 같은 암호를 입력하면 다시 unlock됩니다. */
export function lockEncryption(): void {
  unlockedKey = null;
  notifyKey();
}

function subscribeRow(listener: () => void) {
  rowListeners.add(listener);
  return () => rowListeners.delete(listener);
}
function getRowSnapshot() {
  return encryptionRow;
}
function getRowServerSnapshot(): EncryptionRow | null | undefined {
  return undefined;
}

async function loadEncryptionRow(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    encryptionRow = null;
    notifyRow();
    return;
  }
  const { data, error } = await supabase
    .from("diary_encryption_keys")
    .select("salt, verifier, verifier_iv")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("일기 암호 설정 조회 실패", error);
    encryptionRow = null;
    notifyRow();
    return;
  }
  encryptionRow = data
    ? { salt: data.salt, verifier: data.verifier, verifierIv: data.verifier_iv }
    : null;
  notifyRow();
}

interface EncryptionSetupStatus {
  /** true면 encryptionRow가 아직 undefined라 조회 중입니다. */
  loading: boolean;
  /** 암호가 설정되어 있는지(서버에 salt/verifier가 있는지). */
  isSetUp: boolean;
}

/** "일기 암호"가 설정돼 있는지 조회/구독합니다. 여러 컴포넌트(설정 패널,
 * 글쓰기 화면의 잠금 확인 등)가 같은 조회 결과를 공유합니다 — 매번 새로
 * 쿼리하지 않도록 모듈 캐시를 씁니다. */
export function useEncryptionSetupStatus(): EncryptionSetupStatus {
  const userId = useCurrentUserId();
  const row = useSyncExternalStore(subscribeRow, getRowSnapshot, getRowServerSnapshot);

  useEffect(() => {
    if (!userId) return;
    if (encryptionRow !== undefined) return; // 이미 조회했거나 조회 중
    loadEncryptionRow();
  }, [userId]);

  return { loading: row === undefined, isSetUp: !!row };
}

/** 처음으로 "일기 암호"를 설정합니다. salt를 새로 만들고, 그 암호로 키를
 * 도출해 verifier까지 만들어 diary_encryption_keys에 한 행을 씁니다.
 * 성공하면 곧바로 unlock 상태가 됩니다(다시 입력할 필요 없음). */
export async function setUpEncryption(passphrase: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const salt = generateSalt();
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const { cipher: verifier, iv: verifierIv } = await createVerifier(key);

  const { error } = await supabase.from("diary_encryption_keys").insert({
    user_id: user.id,
    salt,
    verifier,
    verifier_iv: verifierIv,
  });
  if (error) {
    console.error("일기 암호 설정 실패", error);
    return false;
  }

  encryptionRow = { salt, verifier, verifierIv };
  notifyRow();
  unlockedKey = key;
  notifyKey();
  return true;
}

/** 이미 설정된 암호를 입력해 이번 세션의 키를 unlock합니다. 저장된 salt로
 * 키를 도출한 뒤 verifier와 대조해 맞는 암호인지 확인합니다 — 틀리면 false만
 * 돌려주고 unlockedKey는 그대로 null입니다. */
export async function unlockEncryption(passphrase: string): Promise<boolean> {
  if (!encryptionRow) return false;
  const key = await deriveKeyFromPassphrase(passphrase, encryptionRow.salt);
  const ok = await checkVerifier(key, encryptionRow.verifier, encryptionRow.verifierIv);
  if (!ok) return false;
  unlockedKey = key;
  notifyKey();
  return true;
}

/** 암호를 변경합니다 — 현재 암호(oldPassphrase)로 먼저 확인한 뒤, 새 salt/
 * verifier로 diary_encryption_keys 행을 갱신합니다. 주의: 이미 예전 암호로
 * 암호화되어 저장된 글은 새 암호로 다시 열리지 않습니다(이 함수는 "새로 쓸
 * 글부터 쓸 앞으로의 키"만 바꿉니다) — 옛 글은 예전 암호를 기억해야만 다시
 * 열어 새 암호로 저장해야 넘어갑니다. 호출부(EncryptionSettingsPanel)가 이
 * 제약을 화면에 안내합니다. */
export async function changePassphrase(
  oldPassphrase: string,
  newPassphrase: string
): Promise<boolean> {
  if (!encryptionRow) return false;
  const oldKey = await deriveKeyFromPassphrase(oldPassphrase, encryptionRow.salt);
  const oldOk = await checkVerifier(oldKey, encryptionRow.verifier, encryptionRow.verifierIv);
  if (!oldOk) return false;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const salt = generateSalt();
  const newKey = await deriveKeyFromPassphrase(newPassphrase, salt);
  const { cipher: verifier, iv: verifierIv } = await createVerifier(newKey);

  const { error } = await supabase
    .from("diary_encryption_keys")
    .update({ salt, verifier, verifier_iv: verifierIv })
    .eq("user_id", user.id);
  if (error) {
    console.error("일기 암호 변경 실패", error);
    return false;
  }

  encryptionRow = { salt, verifier, verifierIv };
  notifyRow();
  unlockedKey = newKey;
  notifyKey();
  return true;
}

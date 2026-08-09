"use client";

import { useEffect, useRef, useState } from "react";
import { decryptBlob, decryptText } from "@/lib/diaryEncryption";
import { useUnlockedKey } from "@/lib/diaryEncryptionKey";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

const LOCKED_TITLE = "🔒 암호로 보호된 일기";
const DECRYPT_FAILED_TITLE = "🔒 복호화 실패";

/** entry 하나를 화면에 보여줄 수 있는 형태로 만듭니다(암호화 여부와
 * 무관하게 항상 이 함수를 거치면 "표시해도 되는" DiaryEntry가 나옵니다).
 * - entry.encrypted가 false면 그대로 돌려줍니다(기존 평문 글).
 * - true인데 key가 없으면(암호화는 설정돼 있지만 이번 세션에 아직 암호를
 *   입력하지 않음) 잠금 표시만 채운 자리표시자를 돌려줍니다.
 * - true이고 key가 있으면 실제로 복호화합니다.
 *
 * 첨부 이미지는 원본 URL을 fetch해서 암호화된 바이트를 받은 뒤 복호화하고,
 * 그 결과를 URL.createObjectURL로 <img src>에 바로 쓸 수 있는 blob URL로
 * 바꿉니다. 이 blob URL은 다 쓰면 revokeDecryptedImageUrls로 반드시
 * 해제해야 합니다(메모리 누수 방지) — 호출부(useDecryptedEntries,
 * lib/memoryEntries.ts의 훅들)가 정리를 책임집니다. */
export async function decryptDiaryEntryForDisplay(
  entry: DiaryEntry,
  key: CryptoKey | null
): Promise<DiaryEntry> {
  if (!entry.encrypted) return entry;

  if (!key) {
    return { ...entry, title: LOCKED_TITLE, content: "", images: [] };
  }

  try {
    const title = entry.titleIv ? await decryptText(key, entry.title, entry.titleIv) : entry.title;
    const content =
      entry.contentIv && entry.content
        ? await decryptText(key, entry.content, entry.contentIv)
        : entry.content;
    const images = await Promise.all(
      entry.images.map(async (url) => {
        const response = await fetch(url);
        const encryptedBlob = await response.blob();
        // 첨부 이미지는 항상 image/jpeg로 올립니다(lib/memoryEntries.ts의
        // uploadEntryImages 참고) — 암호화된 파일 자체엔 원래 mime 타입
        // 정보가 없어(application/octet-stream으로 올림) 여기서 고정값을 씁니다.
        const decryptedBlob = await decryptBlob(key, encryptedBlob, "image/jpeg");
        return URL.createObjectURL(decryptedBlob);
      })
    );
    return { ...entry, title, content, images };
  } catch (error) {
    // 키가 있어도 손상된 데이터거나(드묾) 네트워크 오류로 이미지를 못
    // 받아온 경우 등 — "잠김"과는 다른 문구로 구분해줍니다.
    console.error("일기 복호화 실패", error);
    return { ...entry, title: DECRYPT_FAILED_TITLE, content: "", images: [] };
  }
}

/** decryptDiaryEntryForDisplay가 만들어낸 blob URL(첨부 이미지)들을
 * 해제합니다. 목록이 다시 그려지거나 컴포넌트가 사라질 때 호출합니다. */
export function revokeDecryptedImageUrls(entry: DiaryEntry): void {
  entry.images.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
}

/** Server Component가 내려준 초기 목록(rawEntries)을 복호화된 버전으로
 * 바꿔줍니다. lib/memoryEntries.ts의 훅들(useMemoryEntries 등)은 이미
 * 내부에서 복호화까지 하지만, DiaryBrowser.tsx/DiaryCalendarBrowser.tsx는
 * 그 훅을 거치지 않고 서버가 준 entries prop을 그대로 쓰기 때문에 이 훅으로
 * 따로 감싸야 합니다.
 *
 * rawEntries는 상위 컴포넌트가 매 렌더마다 새로 만들지 않는(참조가 안정된)
 * 배열이어야 합니다 — 그렇지 않으면 이 효과가 렌더마다 다시 실행됩니다.
 * DiaryBrowser/DiaryCalendarBrowser는 서버에서 받은 entries prop을 그대로
 * 넘기므로 이 조건을 만족합니다. */
export function useDecryptedEntries(rawEntries: DiaryEntry[]): DiaryEntry[] {
  const key = useUnlockedKey();
  const [decrypted, setDecrypted] = useState<DiaryEntry[]>(rawEntries);
  const previousRef = useRef<DiaryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(rawEntries.map((entry) => decryptDiaryEntryForDisplay(entry, key))).then(
      (result) => {
        if (cancelled) return;
        previousRef.current.forEach(revokeDecryptedImageUrls);
        previousRef.current = result;
        setDecrypted(result);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [rawEntries, key]);

  return decrypted;
}

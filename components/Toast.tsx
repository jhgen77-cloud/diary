"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useMounted } from "@/lib/useMounted";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  /** 자동으로 사라지기까지의 시간(ms). 기본 3000. */
  durationMs?: number;
}

/** 화면 상단에 잠깐 나타났다 사라지는 알림 토스트(주로 오류 메시지에 사용). */
export default function Toast({ message, onDismiss, durationMs = 3000 }: ToastProps) {
  const mounted = useMounted();

  // NoticeDialog와 동일한 이유로 ref에 최신 콜백만 담아 타이머가 매 렌더마다
  // 재시작되지 않게 합니다.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });
  useEffect(() => {
    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs]);

  if (!mounted) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex justify-center px-4">
      <div
        role="alert"
        className="pointer-events-auto w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-center text-sm text-[var(--text)] shadow-lg"
      >
        {message}
      </div>
    </div>,
    document.body
  );
}

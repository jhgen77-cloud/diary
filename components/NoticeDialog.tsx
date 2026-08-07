"use client";

import Image, { type StaticImageData } from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { useMounted } from "@/lib/useMounted";

interface NoticeDialogProps {
  icon: StaticImageData;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  /** 지정하면 확인 버튼과 함께 취소 버튼이 표시됩니다(예/아니요 형태). */
  cancelLabel?: string;
  onCancel?: () => void;
  /** true면 확인 버튼을 취소 버튼보다 앞(왼쪽)에 배치합니다. */
  confirmFirst?: boolean;
  /** true면 긴 한 줄 문구가 줄바꿈되지 않도록 더 넓은 박스를 사용합니다. */
  wide?: boolean;
  /** 지정하면 버튼 없이 이 시간(ms) 후 onConfirm이 자동 호출되어 알림이 저절로
   * 사라집니다(예: '같은 날짜의 일기가 존재합니다.' 같은 안내성 토스트). */
  autoDismissMs?: number;
}

export default function NoticeDialog({
  icon,
  message,
  confirmLabel = "확인",
  onConfirm,
  cancelLabel = "아니요",
  onCancel,
  confirmFirst = false,
  wide = false,
  autoDismissMs,
}: NoticeDialogProps) {
  const mounted = useMounted();

  // onConfirm이 렌더마다 새 함수여도 타이머가 매번 재시작되지 않도록 ref로 최신
  // 콜백만 계속 갱신해 두고, 타이머 자체는 autoDismissMs가 바뀔 때만 새로 겁니다.
  const onConfirmRef = useRef(onConfirm);
  useEffect(() => {
    onConfirmRef.current = onConfirm;
  });
  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(() => onConfirmRef.current(), autoDismissMs);
    return () => clearTimeout(timer);
  }, [autoDismissMs]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        className={`flex w-full flex-col items-center gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 ${
          wide ? "max-w-md" : "max-w-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="relative h-6 w-6 shrink-0">
            <Image src={icon} alt="" fill className="object-contain" />
          </span>
          <p className="text-sm whitespace-pre-line text-[var(--text)] sm:text-base">
            {message}
          </p>
        </div>
        {!autoDismissMs && (
          <div className="flex items-center gap-2">
            {confirmFirst && (
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {confirmLabel}
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)]"
              >
                {cancelLabel}
              </button>
            )}
            {!confirmFirst && (
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-sm text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

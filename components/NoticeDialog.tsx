"use client";

import Image, { type StaticImageData } from "next/image";
import { createPortal } from "react-dom";
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
}: NoticeDialogProps) {
  const mounted = useMounted();
  if (!mounted) return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        className={`flex w-full flex-col items-center gap-5 rounded-2xl border border-black/10 bg-zinc-50 p-6 shadow-lg dark:border-white/15 dark:bg-zinc-900 ${
          wide ? "max-w-md" : "max-w-xs"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="relative h-6 w-6 shrink-0">
            <Image src={icon} alt="" fill className="object-contain" />
          </span>
          <p className="text-sm whitespace-pre-line text-black sm:text-base dark:text-zinc-50">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {confirmFirst && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-black px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              {confirmLabel}
            </button>
          )}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-black/10 px-4 py-1.5 text-sm text-black/70 transition-colors hover:bg-black/[.06] dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
            >
              {cancelLabel}
            </button>
          )}
          {!confirmFirst && (
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-black px-4 py-1.5 text-sm text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

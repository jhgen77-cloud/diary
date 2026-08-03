"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => router.back()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-black/10 bg-zinc-50 p-6 shadow-lg sm:p-8 dark:border-white/15 dark:bg-zinc-900"
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="닫기"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-lg text-black/60 transition-colors hover:bg-black/[.06] hover:text-black sm:top-6 sm:right-6 dark:text-zinc-300 dark:hover:bg-white/[.08] dark:hover:text-zinc-50"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

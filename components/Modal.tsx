"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

interface ModalProps {
  title: string;
  size?: "sm" | "lg";
  closeHref?: string;
  children: ReactNode;
}

const SIZE_CLASSES = {
  sm: "max-w-md",
  lg: "max-w-2xl",
} as const;

const controlButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/[.06] hover:text-black dark:text-zinc-300 dark:hover:bg-white/[.08] dark:hover:text-zinc-50";

interface DragState {
  startX: number;
  startY: number;
  baseX: number;
  baseY: number;
  minDeltaX: number;
  maxDeltaX: number;
  minDeltaY: number;
  maxDeltaY: number;
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

export default function Modal({
  title,
  size = "sm",
  closeHref,
  children,
}: ModalProps) {
  const router = useRouter();

  function handleClose() {
    if (closeHref) {
      router.push(closeHref);
    } else {
      router.back();
    }
  }
  const [isMinimized, setIsMinimized] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<DragState | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (!dragState.current) return;
      const { startX, startY, baseX, baseY, minDeltaX, maxDeltaX, minDeltaY, maxDeltaY } =
        dragState.current;
      const deltaX = clamp(event.clientX - startX, minDeltaX, maxDeltaX);
      const deltaY = clamp(event.clientY - startY, minDeltaY, maxDeltaY);
      setOffset({ x: baseX + deltaX, y: baseY + deltaY });
    }
    function handlePointerUp() {
      dragState.current = null;
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  function handleHeaderPointerDown(event: React.PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
      minDeltaX: -rect.left,
      maxDeltaX: window.innerWidth - rect.right,
      minDeltaY: -rect.top,
      maxDeltaY: window.innerHeight - rect.bottom,
    };
  }

  const dimensionClass = isMinimized
    ? SIZE_CLASSES[size]
    : `max-h-[80vh] ${SIZE_CLASSES[size]}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
    >
      <div
        ref={boxRef}
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        className={`flex w-full flex-col rounded-3xl border border-black/10 bg-zinc-50 shadow-lg dark:border-white/15 dark:bg-zinc-900 ${dimensionClass}`}
      >
        <header
          onPointerDown={handleHeaderPointerDown}
          className="flex shrink-0 cursor-grab items-center justify-between gap-4 px-6 py-4 touch-none select-none active:cursor-grabbing sm:px-8"
        >
          <span className="truncate text-lg font-semibold text-black dark:text-zinc-50 sm:text-xl">
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              aria-label="최소화"
              className={controlButtonClass}
            >
              <span className="block h-[2px] w-3 bg-current" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              aria-label="최대화"
              className={controlButtonClass}
            >
              <span className="block h-3 w-3 rounded-[2px] border border-current" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="닫기"
              className={`${controlButtonClass} text-lg`}
            >
              ×
            </button>
          </div>
        </header>
        {!isMinimized && (
          <>
            <div className="mx-6 h-px shrink-0 bg-black/10 sm:mx-8 dark:bg-white/15" />
            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 sm:px-8 sm:pb-8">
              {children}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

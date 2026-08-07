"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMounted } from "@/lib/useMounted";

interface ModalProps {
  title: string;
  size?: "sm" | "lg" | "xl";
  tall?: boolean;
  /** 지정하면 뷰포트 높이의 이 비율(vh)로 고정 높이를 씁니다. tall보다 우선합니다. */
  heightVh?: number;
  closeHref?: string;
  onClose?: () => void;
  /** false면 배경을 어둡게 덮지 않고, 다른 모달 위에 겹쳐 뜨는 창으로 렌더링합니다. */
  overlay?: boolean;
  /** false면 최소화/최대화 버튼 없이 닫기 버튼만 표시합니다. */
  showWindowControls?: boolean;
  /** false면 헤더 우측 닫기(×) 버튼을 표시하지 않습니다. 하단에 별도 닫기 버튼이
   * 있어 기능이 중복되는 경우 등에 사용합니다. */
  showCloseButton?: boolean;
  /** 처음 뜰 때의 화면 중앙 기준 오프셋(px). 다른 모달과 겹치지 않게 살짝 띄우는 용도. */
  defaultOffset?: { x: number; y: number };
  children: ReactNode;
}

const SIZE_CLASSES = {
  sm: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

const controlButtonClass =
  "flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]";

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
  tall = false,
  heightVh,
  closeHref,
  onClose,
  overlay = true,
  showWindowControls = true,
  showCloseButton = true,
  defaultOffset,
  children,
}: ModalProps) {
  const router = useRouter();

  function handleClose() {
    if (onClose) {
      onClose();
    } else if (closeHref) {
      router.push(closeHref);
    } else {
      router.back();
    }
  }
  const [isMinimized, setIsMinimized] = useState(false);
  const [offset, setOffset] = useState(() => defaultOffset ?? { x: 0, y: 0 });
  const dragState = useRef<DragState | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // 겹쳐 뜨는(overlay=false) 모달을 body에 직접 포털로 붙여서, 부모 쪽 transform(다른
  // 모달의 드래그 이동 등)이 fixed 포지셔닝 기준을 바꿔버리는 문제 없이 화면(바탕화면)
  // 전체를 기준으로 자유롭게 이동할 수 있게 합니다.
  const mounted = useMounted();

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
    : `${heightVh ? "" : tall ? "h-[92vh]" : "max-h-[80vh]"} ${SIZE_CLASSES[size]}`;

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 flex items-center justify-center p-4 ${
        overlay
          ? "z-50 bg-black/40 backdrop-blur-sm"
          : "z-[60] pointer-events-none"
      }`}
    >
      <div
        ref={boxRef}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          ...(heightVh && !isMinimized ? { height: `${heightVh}vh` } : {}),
        }}
        className={`flex w-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] ${
          overlay ? "" : "pointer-events-auto"
        } ${dimensionClass}`}
      >
        <header
          onPointerDown={handleHeaderPointerDown}
          className="flex shrink-0 cursor-grab items-center justify-between gap-4 px-6 py-4 touch-none select-none active:cursor-grabbing sm:px-8"
        >
          <span className="truncate text-lg font-semibold text-[var(--text)] sm:text-xl">
            {title}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {showWindowControls && (
              <>
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
              </>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                aria-label="닫기"
                className={`${controlButtonClass} text-lg`}
              >
                ×
              </button>
            )}
          </div>
        </header>
        {!isMinimized && (
          <>
            <div className="mx-6 h-px shrink-0 bg-[var(--border)] sm:mx-8" />
            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 sm:px-8 sm:pb-8">
              {children}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

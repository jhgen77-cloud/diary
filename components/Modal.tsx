"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
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

  // defaultOffset(예: ImageAttachModal의 {x:64, y:48})는 화면 폭과 무관한 고정
  // px 값이라, 창이 좁을수록(모바일 등) 박스가 화면 중앙 기준으로 밀려나며
  // 오른쪽/아래 바깥으로 잘려 나갈 수 있었습니다 — 이 컨테이너엔 스크롤이 없어
  // 잘린 부분은 아예 보이지도, 드래그로 되돌릴 수도 없었습니다(드래그 클램프가
  // "이미 화면 밖으로 나간 현재 위치"를 기준으로 계산되어, 더 밖으로 나가는
  // 방향은 허용 범위가 거의 0으로 막혀버려 그 방향으로는 드래그해도 전혀
  // 움직이지 않았습니다). 마운트 시점과 창 크기가 바뀔 때마다, 박스가 화면
  // 안에 완전히 들어오도록 offset을 다시 clamp합니다.
  useLayoutEffect(() => {
    if (!mounted) return;

    function clampOffsetToViewport() {
      // 드래그 도중에는 손대지 않습니다 — 모바일 브라우저의 주소창 접힘/펼침 등으로
      // 드래그 중에도 resize 이벤트가 끼어들 수 있는데, 그때 이 함수가 위치를
      // 되돌려버리면 사용자가 끌고 있는 방향과 계속 충돌해 드래그가 뻑뻑하게
      // 느껴집니다(실제로 겪은 문제).
      if (dragState.current) return;
      const rect = boxRef.current?.getBoundingClientRect();
      if (!rect) return;
      setOffset((prev) => {
        // rect는 현재 적용된 offset(prev)까지 반영된 실제 화면 위치이므로,
        // 여기서 offset을 뺀 "오프셋 0일 때의(자연 중앙 배치)" 좌표를 구해야
        // 그 기준으로 다시 유효한 offset 범위를 계산할 수 있습니다.
        const naturalLeft = rect.left - prev.x;
        const naturalTop = rect.top - prev.y;
        const minX = -naturalLeft;
        const maxX = window.innerWidth - rect.width - naturalLeft;
        const minY = -naturalTop;
        const maxY = window.innerHeight - rect.height - naturalTop;
        // 박스가 뷰포트보다 커서 maxX < minX(세로는 maxY < minY)이면 clamp()가
        // min 쪽(왼쪽/위)으로 맞춰 최소한 그쪽 경계는 화면 안에 들어오게 합니다.
        const nextX = clamp(prev.x, minX, maxX);
        const nextY = clamp(prev.y, minY, maxY);
        if (nextX === prev.x && nextY === prev.y) return prev;
        return { x: nextX, y: nextY };
      });
    }

    clampOffsetToViewport();
    window.addEventListener("resize", clampOffsetToViewport);
    return () => window.removeEventListener("resize", clampOffsetToViewport);
  }, [mounted]);

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
    : `${heightVh ? "" : tall ? "h-[92dvh]" : "max-h-[80dvh]"} ${SIZE_CLASSES[size]}`;

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
          ...(heightVh && !isMinimized ? { height: `${heightVh}dvh` } : {}),
        }}
        className={`flex w-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] ${
          overlay ? "" : "pointer-events-auto"
        } ${dimensionClass}`}
      >
        {/* showWindowControls가 false인 모달(환경 설정 등)은 최소화/최대화
           버튼 자체를 숨겨서 "떠다니는 창"이 아니라 고정된 대화상자처럼
           보이게 했는데, 정작 헤더는 여전히 드래그가 가능해 사용자가 제목
           영역을 살짝 건드리기만 해도 전체 모달이 상하좌우로 밀려나는
           문제가 있었습니다(실제로 겪은 문제) — 창 컨트롤을 숨긴 모달은
           드래그도 함께 꺼서, 보이는 대로(고정 대화상자) 동작하게 합니다. */}
        <header
          onPointerDown={showWindowControls ? handleHeaderPointerDown : undefined}
          className={`flex shrink-0 items-center justify-between gap-4 px-6 py-4 select-none sm:px-8 ${
            showWindowControls ? "cursor-grab touch-none active:cursor-grabbing" : ""
          }`}
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

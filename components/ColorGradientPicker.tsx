"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/color";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface ColorGradientPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

/** Combined Color Palette의 핵심 — 채도/명도(SV) 사각형 + 색상(hue) 슬라이더로
 * 임의의 색을 자유롭게 고릅니다. 프리셋 그리드(정해진 색만 고를 수 있음)와 달리
 * 연속적인 색상 공간 전체를 다룰 수 있어 "통합형"의 핵심 부분입니다.
 * Modal.tsx의 드래그(포인터 이벤트 + getBoundingClientRect) 패턴을 그대로
 * 따릅니다. */
export default function ColorGradientPicker({ value, onChange }: ColorGradientPickerProps) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));

  // 바깥에서(프리셋 클릭, hex 직접 입력 등) value가 바뀌면 내부 hsv도 맞춥니다.
  // 자기 자신의 드래그로 인한 변경은 hsv에서 계산해 나온 hex와 value가 이미
  // 같으므로 이 조건이 다시 걸리지 않습니다(불필요한 재동기화 및 그로 인한
  // hue 흔들림 방지). useEffect 대신 렌더 중 상태를 바로잡는 React 공식
  // 패턴(https://react.dev/learn/you-might-not-need-an-effect)을 씁니다.
  if (hsvToHex(hsv).toLowerCase() !== value.toLowerCase()) {
    setHsv(hexToHsv(value));
  }

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<"sv" | "hue" | null>(null);

  const updateFromSv = useCallback(
    (clientX: number, clientY: number) => {
      const rect = svRef.current?.getBoundingClientRect();
      if (!rect) return;
      const s = clamp((clientX - rect.left) / rect.width, 0, 1);
      const v = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
      const next: Hsv = { ...hsv, s, v };
      setHsv(next);
      onChange(hsvToHex(next));
    },
    [hsv, onChange]
  );

  const updateFromHue = useCallback(
    (clientX: number) => {
      const rect = hueRef.current?.getBoundingClientRect();
      if (!rect) return;
      const h = clamp(((clientX - rect.left) / rect.width) * 360, 0, 360);
      const next: Hsv = { ...hsv, h };
      setHsv(next);
      onChange(hsvToHex(next));
    },
    [hsv, onChange]
  );

  // 드래그 중엔 포인터가 사각형/슬라이더 밖으로 나가도 계속 값을 갱신해야 하므로
  // window 전체에 리스너를 겁니다. hsv가 바뀔 때마다 재구독되지만(각 핸들러가
  // 최신 hsv를 클로저로 참조해야 하므로), 짧은 드래그 조작이라 성능에 문제되지
  // 않습니다.
  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      if (draggingRef.current === "sv") updateFromSv(event.clientX, event.clientY);
      else if (draggingRef.current === "hue") updateFromHue(event.clientX);
    }
    function handlePointerUp() {
      draggingRef.current = null;
    }
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [updateFromSv, updateFromHue]);

  const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

  return (
    <div className="flex flex-col gap-2">
      {/* 채도(가로) × 명도(세로) 사각형. 흰색→hue 가로 그라디언트 위에 투명→검정
         세로 그라디언트를 겹쳐 클래식한 SV 사각형을 순수 CSS로 만듭니다. */}
      <div
        ref={svRef}
        onPointerDown={(event) => {
          draggingRef.current = "sv";
          updateFromSv(event.clientX, event.clientY);
        }}
        className="relative h-28 w-full cursor-crosshair touch-none rounded-lg sm:h-32"
        style={{
          backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueColor})`,
        }}
      >
        <span
          className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: hsvToHex(hsv),
          }}
        />
      </div>

      {/* 색상(hue) 슬라이더. */}
      <div
        ref={hueRef}
        onPointerDown={(event) => {
          draggingRef.current = "hue";
          updateFromHue(event.clientX);
        }}
        className="relative h-3 w-full cursor-pointer touch-none rounded-full"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
        }}
      >
        <span
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.4)]"
          style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: hueColor }}
        />
      </div>
    </div>
  );
}

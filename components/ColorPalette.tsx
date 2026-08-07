"use client";

import { useEffect, useRef, useState } from "react";
import ColorGradientPicker from "@/components/ColorGradientPicker";
import { isValidHex } from "@/lib/color";

interface PaletteColor {
  label: string;
  hex: string;
}

const PALETTE_COLORS: PaletteColor[] = [
  { label: "흰색", hex: "#ffffff" },
  { label: "연회색", hex: "#e4e4e7" },
  { label: "검정", hex: "#111111" },
  { label: "빨강", hex: "#ef4444" },
  { label: "주황", hex: "#f97316" },
  { label: "노랑", hex: "#eab308" },
  { label: "초록", hex: "#22c55e" },
  { label: "하늘", hex: "#0ea5e9" },
  { label: "파랑", hex: "#3b82f6" },
  { label: "보라", hex: "#a855f7" },
  { label: "분홍", hex: "#ec4899" },
  { label: "갈색", hex: "#92400e" },
];

interface ColorPaletteProps {
  value: string;
  onChange: (hex: string) => void;
  /** 배경타입이 "없음"일 때 등, 아직 색상 선택이 의미 없는 상태에서 흐리게
   * 비활성화합니다. */
  disabled?: boolean;
}

/** Combined Color Palette(통합형 컬러 팔레트) — 배경색을 고르는 색상 선택 버튼 +
 * 펼침 패널. 채도/명도 사각형 + 색상 슬라이더(ColorGradientPicker, 연속적인
 * 색 전체)와 hex 직접 입력, 자주 쓰는 프리셋 스와치를 한 패널에 모두 묶어
 * "통합형"으로 구성했습니다. DataExportSplitOptions/FontFamilySelect와 같은
 * 펼침 버튼(▾) + 바깥 클릭 시 닫히는 드롭다운 패턴을 그대로 따릅니다. */
export default function ColorPalette({ value, onChange, disabled = false }: ColorPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [lastSyncedValue, setLastSyncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const open = isOpen && !disabled;

  // 패널이 열려 있는 동안 그라디언트 드래그/프리셋 클릭으로 값이 바뀌면
  // 입력창에도 반영합니다(닫혀 있을 때나, 사용자가 직접 타이핑 중일 때는
  // value 자체가 바뀌지 않으므로 이 조건이 걸리지 않아 입력 중인 텍스트를
  // 덮어쓰지 않습니다). useEffect 대신 렌더 중 상태를 바로잡는 React 공식
  // 패턴을 씁니다.
  if (open && value !== lastSyncedValue) {
    setLastSyncedValue(value);
    setHexInput(value);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function commitHexInput() {
    const trimmed = hexInput.trim();
    if (isValidHex(trimmed)) {
      const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
      onChange(normalized);
      setHexInput(normalized);
    } else {
      setHexInput(value); // 잘못된 값이면 마지막으로 유효했던 값으로 되돌립니다.
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block transition-opacity ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        disabled={disabled}
        className="flex w-40 items-center justify-between gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-left transition-colors hover:bg-black/[.06] sm:w-48 dark:border-white/15 dark:bg-white/[.04] dark:hover:bg-white/[.08]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10 dark:border-white/20"
            style={{ backgroundColor: value }}
          />
          <span className="truncate text-xs text-black/80 sm:text-sm dark:text-zinc-200">
            {value}
          </span>
        </span>
        <span
          className={`shrink-0 text-[0.6rem] text-black/50 transition-transform sm:text-xs dark:text-zinc-400 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div
          aria-label="배경 색상 팔레트"
          className="absolute top-full left-0 z-10 mt-1 flex w-56 flex-col gap-3 rounded-xl border border-black/10 bg-zinc-50 p-3 shadow-lg sm:w-64 dark:border-white/15 dark:bg-zinc-900"
        >
          <ColorGradientPicker value={value} onChange={onChange} />

          <div className="flex items-center gap-2">
            <span
              className="h-7 w-7 shrink-0 rounded-full border border-black/10 dark:border-white/20"
              style={{ backgroundColor: isValidHex(hexInput) ? hexInput : value }}
            />
            <input
              type="text"
              value={hexInput}
              onChange={(event) => setHexInput(event.target.value)}
              onBlur={commitHexInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitHexInput();
                }
              }}
              spellCheck={false}
              aria-label="색상 코드(hex) 직접 입력"
              className="h-8 min-w-0 flex-1 rounded-full border border-black/10 bg-white/60 px-3 text-xs text-black uppercase outline-none focus:border-black/30 sm:text-sm dark:border-white/15 dark:bg-white/[.04] dark:text-zinc-50 dark:focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {PALETTE_COLORS.map((color) => {
              const selected = color.hex.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={color.hex}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color.label}
                  title={color.label}
                  onClick={() => onChange(color.hex)}
                  className={`aspect-square rounded-full border transition-transform active:scale-90 ${
                    selected
                      ? "border-black ring-2 ring-black/60 dark:border-white dark:ring-white/60"
                      : "border-black/10 dark:border-white/20"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

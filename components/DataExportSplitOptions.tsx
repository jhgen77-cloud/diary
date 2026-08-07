"use client";

import { useEffect, useRef, useState } from "react";
import DataOptionRadio from "@/components/DataOptionRadio";

export type ExportSplitOption = "year" | "single" | "year-month" | "date";

interface SplitOption {
  key: ExportSplitOption;
  label: string;
}

// 선택란을 처음 펼쳤을 때 top-down으로 나열할 기본 순서입니다.
const SPLIT_OPTIONS: SplitOption[] = [
  { key: "single", label: "하나의 파일로 내보내기" },
  { key: "year", label: "연도별로 파일 생성" },
  { key: "year-month", label: "연,월별로 파일 생성" },
  { key: "date", label: "날짜별로 파일 생성" },
];

const SPLIT_LABELS = Object.fromEntries(
  SPLIT_OPTIONS.map((option) => [option.key, option.label])
) as Record<ExportSplitOption, string>;

const DEFAULT_ORDER: ExportSplitOption[] = SPLIT_OPTIONS.map((option) => option.key);

interface DataExportSplitOptionsProps {
  value: ExportSplitOption;
  onChange: (value: ExportSplitOption) => void;
  /** 이 컴포넌트가 속한 파일 형식(ZIP/TXT)이 현재 선택돼 있을 때만 활성화되고,
   * 그 외에는 흐리게 비활성화됩니다. */
  disabled?: boolean;
}

/** '파일 생성 옵션' 선택란. ZIP/TXT 두 형식 모두 하나의 파일로 묶을지, 연도/연,월/
 * 날짜별로 나눌지를 이 컴포넌트로 고릅니다(형식마다 하나씩, 총 두 곳에서 재사용).
 * 평소에는 닫힌 채 현재 선택된 옵션 텍스트만 보여주다가, 클릭하면 4개 옵션을
 * top-down 방식으로 펼쳐서 고를 수 있습니다. DiaryWeatherField의 펼침 버튼(▾) +
 * 바깥 클릭 시 닫히는 패널 패턴을 그대로 따릅니다. */
export default function DataExportSplitOptions({
  value,
  onChange,
  disabled = false,
}: DataExportSplitOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  // 옵션을 고를 때마다 해당 옵션이 목록 첫 위치로 올라가고, 모달을 닫아 이 컴포넌트가
  // 다시 마운트되기 전까지는 그 순서가 유지됩니다.
  const [order, setOrder] = useState<ExportSplitOption[]>(DEFAULT_ORDER);
  const containerRef = useRef<HTMLDivElement>(null);

  // 소속된 형식이 선택되지 않아 비활성화되면 펼쳐져 있던 선택란도 닫힌 것으로
  // 취급합니다. (state를 effect로 되돌리는 대신, 렌더링 시점에 바로 파생시킵니다.)
  const open = isOpen && !disabled;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block transition-opacity ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        disabled={disabled}
        className="flex w-44 items-center justify-between gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-left transition-colors hover:bg-black/[.06] sm:w-52 dark:border-white/15 dark:bg-white/[.04] dark:hover:bg-white/[.08]"
      >
        <span className="truncate text-xs text-black/80 sm:text-sm dark:text-zinc-200">
          {SPLIT_LABELS[value]}
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
          aria-label="파일 생성 옵션"
          className="absolute top-full left-0 z-10 mt-1 flex w-44 flex-col rounded-xl border border-black/10 bg-zinc-50 p-1 shadow-lg sm:w-52 dark:border-white/15 dark:bg-zinc-900"
        >
          {order.map((key) => (
            <DataOptionRadio
              key={key}
              label={SPLIT_LABELS[key]}
              selected={value === key}
              onSelect={() => {
                onChange(key);
                setOrder((prev) => [key, ...prev.filter((k) => k !== key)]);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

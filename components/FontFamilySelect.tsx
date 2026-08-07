"use client";

import { useEffect, useRef, useState } from "react";
import DataOptionRadio from "@/components/DataOptionRadio";
import type { FontFamilyKey } from "@/lib/environmentSettings";

export type { FontFamilyKey };

interface FontFamilyOption {
  key: FontFamilyKey;
  label: string;
  /** 목록/버튼 텍스트를 실제로 그 계열 글꼴로 미리 보여주기 위한 CSS font-family. */
  cssFontFamily: string;
}

const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  { key: "system", label: "시스템 기본", cssFontFamily: "var(--font-geist-sans), system-ui, sans-serif" },
  { key: "sans", label: "고딕체", cssFontFamily: "ui-sans-serif, sans-serif" },
  { key: "serif", label: "명조체", cssFontFamily: "ui-serif, serif" },
  { key: "mono", label: "고정폭", cssFontFamily: "var(--font-geist-mono), ui-monospace, monospace" },
  { key: "handwriting", label: "손글씨체", cssFontFamily: "cursive" },
];

export const FONT_FAMILY_CSS: Record<FontFamilyKey, string> = Object.fromEntries(
  FONT_FAMILY_OPTIONS.map((option) => [option.key, option.cssFontFamily])
) as Record<FontFamilyKey, string>;

const FONT_FAMILY_LABELS: Record<FontFamilyKey, string> = Object.fromEntries(
  FONT_FAMILY_OPTIONS.map((option) => [option.key, option.label])
) as Record<FontFamilyKey, string>;

interface FontFamilySelectProps {
  value: FontFamilyKey;
  onChange: (value: FontFamilyKey) => void;
}

/** '폰트명(Font Family)' 선택란. DataExportSplitOptions의 펼침 버튼(▾) + 바깥
 * 클릭 시 닫히는 드롭다운 패턴을 그대로 따릅니다(다른 값 종류라 그 컴포넌트를
 * 직접 재사용할 순 없어, 같은 패턴으로 다시 구성했습니다). 각 옵션은 실제 그
 * 글꼴로 미리보기 텍스트를 보여줍니다. */
export default function FontFamilySelect({ value, onChange }: FontFamilySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex w-40 items-center justify-between gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-left transition-colors hover:bg-black/[.06] sm:w-48 dark:border-white/15 dark:bg-white/[.04] dark:hover:bg-white/[.08]"
      >
        <span
          className="truncate text-xs text-black/80 sm:text-sm dark:text-zinc-200"
          style={{ fontFamily: FONT_FAMILY_CSS[value] }}
        >
          {FONT_FAMILY_LABELS[value]}
        </span>
        <span
          className={`shrink-0 text-[0.6rem] text-black/50 transition-transform sm:text-xs dark:text-zinc-400 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div
          aria-label="폰트명 선택"
          className="absolute top-full left-0 z-10 mt-1 flex w-40 flex-col rounded-xl border border-black/10 bg-zinc-50 p-1 shadow-lg sm:w-48 dark:border-white/15 dark:bg-zinc-900"
        >
          {FONT_FAMILY_OPTIONS.map((option) => (
            <DataOptionRadio
              key={option.key}
              label={option.label}
              selected={value === option.key}
              onSelect={() => {
                onChange(option.key);
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import type { TextAlignKey } from "@/lib/environmentSettings";

interface AlignOption {
  key: TextAlignKey;
  label: string;
}

const ALIGN_OPTIONS: AlignOption[] = [
  { key: "left", label: "왼쪽" },
  { key: "center", label: "가운데" },
  { key: "right", label: "오른쪽" },
  { key: "justify", label: "양쪽" },
];

interface TextAlignmentSelectProps {
  value: TextAlignKey;
  onChange: (value: TextAlignKey) => void;
}

/** '정렬기준(Text Alignment)' 선택란. DataTabNav의 탭 버튼과 같은 알약 모양
 * 버튼 스타일을 재사용해, 선택된 정렬 방식만 검게 강조합니다. */
export default function TextAlignmentSelect({ value, onChange }: TextAlignmentSelectProps) {
  return (
    <div role="radiogroup" aria-label="정렬기준" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {ALIGN_OPTIONS.map((option) => {
        const selected = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              selected
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--border)] text-[var(--text-sub)] hover:bg-[var(--hover)]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

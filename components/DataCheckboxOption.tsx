interface DataCheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

/** 체크박스 + 라벨. DataOptionRadio(원형 라디오)와 짝을 이루는 사각형 체크 스타일로,
 * '전체 글 내보내기' 등 독립적인 켬/끔 옵션에 씁니다. */
export default function DataCheckboxOption({
  label,
  checked,
  onChange,
  disabled = false,
}: DataCheckboxOptionProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="flex shrink-0 items-center gap-2 rounded-xl px-1 py-1 text-left transition-colors hover:bg-[var(--hover)] disabled:pointer-events-none disabled:opacity-40"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-colors ${
          checked
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--border)]"
        }`}
      >
        {checked && (
          <svg
            viewBox="0 0 12 12"
            className="h-2.5 w-2.5 stroke-white"
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 6l3 3 5-6" />
          </svg>
        )}
      </span>
      <span className="text-xs whitespace-nowrap text-[var(--text-sub)] sm:text-sm">
        {label}
      </span>
    </button>
  );
}

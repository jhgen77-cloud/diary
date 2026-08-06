interface DataOptionRadioProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/** 옵션 선택용 라디오 행. 앱 전반에서 네이티브 라디오 대신 버튼 기반 선택 UI를 쓰는
 * 방식(예: IconOption)에 맞춰 통일했습니다. */
export default function DataOptionRadio({
  label,
  selected,
  onSelect,
}: DataOptionRadioProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-black/[.06] dark:hover:bg-white/[.08]"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected
            ? "border-black bg-black dark:border-white dark:bg-white"
            : "border-black/30 dark:border-white/40"
        }`}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
        )}
      </span>
      <span className="text-xs text-black/80 sm:text-sm dark:text-zinc-200">
        {label}
      </span>
    </button>
  );
}

interface DataExportFormatOptionProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

/** 내보내기 파일 형식(ZIP/TXT) 선택용 라디오 행. DataOptionRadio와 같은 원형 라디오
 * 스타일을 쓰되, 항목마다 설명 문구가 한 줄 더 붙어 위쪽 정렬로 배치합니다. */
export default function DataExportFormatOption({
  label,
  description,
  selected,
  onSelect,
}: DataExportFormatOptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full items-start gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-black/[.06] dark:hover:bg-white/[.08]"
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
          selected
            ? "border-black bg-black dark:border-white dark:bg-white"
            : "border-black/30 dark:border-white/40"
        }`}
      >
        {selected && (
          <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black" />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-black sm:text-sm dark:text-zinc-50">
          {label}
        </span>
        <span className="text-[0.7rem] text-black/60 sm:text-xs dark:text-zinc-400">
          {description}
        </span>
      </span>
    </button>
  );
}

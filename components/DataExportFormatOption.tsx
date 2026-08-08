import type { ReactNode } from "react";

interface DataExportFormatOptionProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  /** 이 형식을 선택했을 때만 의미가 있는 하위 옵션(예: TXT의 '파일 생성 옵션').
   * description 텍스트와 좌측이 맞도록 들여써서 라디오 행 바로 아래에 배치됩니다. */
  children?: ReactNode;
}

/** 내보내기 파일 형식(ZIP/TXT) 선택용 라디오 행. DataOptionRadio와 같은 원형 라디오
 * 스타일을 쓰되, 항목마다 설명 문구가 한 줄 더 붙어 위쪽 정렬로 배치합니다.
 * children이 있으면 해당 형식의 하위 구성 옵션을 라디오 행 아래에 이어서 보여줍니다. */
export default function DataExportFormatOption({
  label,
  description,
  selected,
  onSelect,
  children,
}: DataExportFormatOptionProps) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className="flex w-full items-start gap-2.5 rounded-xl px-2 py-1 text-left transition-colors hover:bg-[var(--hover)]"
      >
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
            selected
              ? "border-[var(--accent)] bg-[var(--accent)]"
              : "border-[var(--border)]"
          }`}
        >
          {selected && (
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs font-medium text-[var(--text)] sm:text-sm">
            {label}
          </span>
          <span className="text-[0.7rem] text-[var(--text-sub)] sm:text-xs">
            {description}
          </span>
        </span>
      </button>
      {/* 들여쓰기(2.125rem) = 라디오 아이콘(1rem) + 아이콘-텍스트 간격(0.625rem)
         + 버튼 좌측 여백(0.5rem). description 텍스트와 좌측이 맞습니다. */}
      {children && <div className="pl-[2.125rem]">{children}</div>}
    </div>
  );
}

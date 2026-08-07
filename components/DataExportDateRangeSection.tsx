import DataExportDateField from "@/components/DataExportDateField";
import DataCheckboxOption from "@/components/DataCheckboxOption";
import type { DateValue } from "@/lib/exportDiaryEntries";

interface DataExportDateRangeSectionProps {
  startDate: DateValue;
  endDate: DateValue;
  onChangeStart: (value: DateValue) => void;
  onChangeEnd: (value: DateValue) => void;
  exportAll: boolean;
  onToggleExportAll: () => void;
  deleteAfterExport: boolean;
  onToggleDeleteAfterExport: () => void;
  onExport: () => void;
  exporting: boolean;
}

/** '일기 날짜 선택' 박스 — 시작/종료 일자, 전체 글 내보내기, 내보내기 후 삭제 옵션과
 * 내보내기 버튼을 한데 묶습니다. 내보내기 버튼은 별도 열로 분리하지 않고, 삭제 옵션
 * 텍스트와 같은 줄에 두어(justify-between) 그 줄의 우측 가장자리에 맞춥니다. */
export default function DataExportDateRangeSection({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  exportAll,
  onToggleExportAll,
  deleteAfterExport,
  onToggleDeleteAfterExport,
  onExport,
  exporting,
}: DataExportDateRangeSectionProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-black/[.06] p-2.5 dark:border-white/[.08]">
      <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
        일기 날짜 선택
      </p>

      <div className="flex flex-nowrap items-center gap-6">
        <DataExportDateField
          label="시작 일자"
          value={startDate}
          onChange={onChangeStart}
          disabled={exportAll}
        />
        <DataCheckboxOption
          label="전체 글 내보내기"
          checked={exportAll}
          onChange={onToggleExportAll}
        />
      </div>
      <DataExportDateField
        label="종료 일자"
        value={endDate}
        onChange={onChangeEnd}
        disabled={exportAll}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DataCheckboxOption
          label="내보내기 완료 후 내보내기한 글을 삭제합니다."
          checked={deleteAfterExport}
          onChange={onToggleDeleteAfterExport}
        />
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="shrink-0 rounded-full border border-black/10 px-4 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/[.06] disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          {exporting ? "내보내는 중…" : "내보내기"}
        </button>
      </div>
    </div>
  );
}

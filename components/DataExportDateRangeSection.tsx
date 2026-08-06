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
  yearOptions: number[];
  onExport: () => void;
  exporting: boolean;
}

/** '일기 날짜 선택' 박스 — 시작/종료 일자, 전체 글 내보내기, 내보내기 후 삭제 옵션과
 * 우측 가장자리의 내보내기 버튼을 한데 묶습니다. */
export default function DataExportDateRangeSection({
  startDate,
  endDate,
  onChangeStart,
  onChangeEnd,
  exportAll,
  onToggleExportAll,
  deleteAfterExport,
  onToggleDeleteAfterExport,
  yearOptions,
  onExport,
  exporting,
}: DataExportDateRangeSectionProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
      <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
        일기 날짜 선택
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-nowrap items-center justify-between gap-2">
            <DataExportDateField
              label="시작 일자"
              value={startDate}
              onChange={onChangeStart}
              yearOptions={yearOptions}
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
            yearOptions={yearOptions}
            disabled={exportAll}
          />
          <DataCheckboxOption
            label="내보내기 완료 후 내보내기한 글을 삭제합니다."
            checked={deleteAfterExport}
            onChange={onToggleDeleteAfterExport}
          />
        </div>

        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="shrink-0 self-start rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:self-center sm:text-sm dark:bg-white dark:text-black"
        >
          {exporting ? "내보내는 중…" : "내보내기"}
        </button>
      </div>
    </div>
  );
}

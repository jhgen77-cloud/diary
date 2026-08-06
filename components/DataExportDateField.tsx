import type { DateValue } from "@/lib/exportDiaryEntries";

interface DataExportDateFieldProps {
  label: string;
  value: DateValue;
  onChange: (value: DateValue) => void;
  yearOptions: number[];
  disabled?: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const selectClass =
  "h-7 min-w-0 rounded-full border border-black/10 bg-white/60 px-2 text-xs text-black outline-none focus:border-black/30 disabled:opacity-40 sm:h-8 sm:text-sm dark:border-white/15 dark:bg-white/[.04] dark:text-zinc-50 dark:focus:border-white/30";

/** '시작 일자'/'종료 일자' 라벨을 박스로 감싸고, 옆에 연/월/일을 각각 고를 수 있는
 * 선택란(select)을 붙입니다. FieldLabel과 같은 박스 스타일이지만, 라벨 글자 수가 더
 * 길어(예: "시작 일자") 고정폭 대신 내용에 맞춘 너비를 씁니다. */
export default function DataExportDateField({
  label,
  value,
  onChange,
  yearOptions,
  disabled = false,
}: DataExportDateFieldProps) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
      <span className="shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:text-sm dark:border-white/15 dark:text-zinc-300">
        {label}
      </span>
      <select
        aria-label={`${label} 년`}
        value={value.year}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, year: Number(event.target.value) })}
        className={selectClass}
      >
        {yearOptions.map((year) => (
          <option key={year} value={year}>
            {year}년
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} 월`}
        value={value.month}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, month: Number(event.target.value) })}
        className={selectClass}
      >
        {MONTHS.map((month) => (
          <option key={month} value={month}>
            {month}월
          </option>
        ))}
      </select>
      <select
        aria-label={`${label} 일`}
        value={value.day}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, day: Number(event.target.value) })}
        className={selectClass}
      >
        {DAYS.map((day) => (
          <option key={day} value={day}>
            {day}일
          </option>
        ))}
      </select>
    </div>
  );
}

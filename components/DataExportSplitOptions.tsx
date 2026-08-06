import DataOptionRadio from "@/components/DataOptionRadio";

export type TxtSplitOption = "year" | "single" | "year-month" | "date";

interface SplitOption {
  key: TxtSplitOption;
  label: string;
}

// top-down 순서 그대로 표시합니다.
const SPLIT_OPTIONS: SplitOption[] = [
  { key: "year", label: "연도별로 파일 생성" },
  { key: "single", label: "하나의 파일로 내보내기" },
  { key: "year-month", label: "연,월별로 파일 생성" },
  { key: "date", label: "날짜별로 파일 생성" },
];

interface DataExportSplitOptionsProps {
  value: TxtSplitOption;
  onChange: (value: TxtSplitOption) => void;
  /** TXT 파일을 선택했을 때만 활성화되고, 그 외에는 흐리게 비활성화됩니다. */
  disabled?: boolean;
}

export default function DataExportSplitOptions({
  value,
  onChange,
  disabled = false,
}: DataExportSplitOptionsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="파일 생성 옵션"
      aria-disabled={disabled}
      className={`flex flex-col transition-opacity ${
        disabled ? "pointer-events-none opacity-40" : ""
      }`}
    >
      {SPLIT_OPTIONS.map((item) => (
        <DataOptionRadio
          key={item.key}
          label={item.label}
          selected={value === item.key}
          onSelect={() => onChange(item.key)}
        />
      ))}
    </div>
  );
}

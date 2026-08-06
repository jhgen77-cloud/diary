"use client";

import Image from "next/image";
import { useState } from "react";
import { calendarIcon } from "@/lib/diaryIcons";
import MiniCalendarPicker from "@/components/MiniCalendarPicker";
import { dateToDateValue, dateValueToDate, type DateValue } from "@/lib/exportDiaryEntries";

interface DataExportDateFieldProps {
  label: string;
  value: DateValue;
  onChange: (value: DateValue) => void;
  disabled?: boolean;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** '시작 일자'/'종료 일자' 라벨을 박스로 감싸고, 연/월/일/요일을 하나로 합친 선택란과
 * 우측 가장자리 달력 아이콘을 붙입니다. 아이콘을 누르면 DiaryDateField와 같은 방식으로
 * MiniCalendarPicker 팝업이 열려 날짜를 고를 수 있습니다. */
export default function DataExportDateField({
  label,
  value,
  onChange,
  disabled = false,
}: DataExportDateFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const date = dateValueToDate(value);
  // 전체 글 내보내기 등으로 비활성화되면 열려 있던 달력도 닫힌 것으로 취급합니다.
  // (state를 effect로 되돌리는 대신, 렌더링 시점에 바로 파생시킵니다.)
  const isPickerVisible = isPickerOpen && !disabled;

  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
      <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:px-5 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300">
        {label}
      </span>
      <div
        className={`relative flex min-w-[10.5rem] items-center justify-between gap-2 rounded-full border border-black/10 bg-white/60 py-0.5 pr-1.5 pl-3.5 transition-opacity sm:min-w-[13rem] sm:py-1 dark:border-white/15 dark:bg-white/[.04] ${
          disabled ? "opacity-40" : ""
        }`}
      >
        <span className="truncate text-xs text-black sm:text-sm dark:text-zinc-50">
          {date.getFullYear()}년 {date.getMonth() + 1}월 {date.getDate()}일 (
          {WEEKDAYS_KO[date.getDay()]})
        </span>
        <button
          type="button"
          onClick={() => setIsPickerOpen((prev) => !prev)}
          disabled={disabled}
          aria-label={`${label} 달력 열기`}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/[.06] disabled:pointer-events-none sm:h-6 sm:w-6 dark:hover:bg-white/[.08]"
        >
          <span className="relative aspect-square h-3.5 w-3.5 sm:h-4 sm:w-4">
            <Image src={calendarIcon} alt="달력" fill className="object-contain" />
          </span>
        </button>
        {isPickerVisible && (
          <MiniCalendarPicker
            value={date}
            onSelect={(newDate) => {
              onChange(dateToDateValue(newDate));
              setIsPickerOpen(false);
            }}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

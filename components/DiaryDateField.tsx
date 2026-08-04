"use client";

import Image from "next/image";
import { useState } from "react";
import { calendarIcon } from "@/lib/diaryIcons";
import FieldLabel from "@/components/FieldLabel";
import MiniCalendarPicker from "@/components/MiniCalendarPicker";

interface DiaryDateFieldProps {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

export default function DiaryDateField({
  value,
  onChange,
}: DiaryDateFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1 sm:px-4">
      <div className="flex items-center gap-2">
        <FieldLabel>날짜</FieldLabel>
        <span className="text-xs text-black sm:text-sm dark:text-zinc-50">
          {value.getFullYear()}년 {value.getMonth() + 1}월 {value.getDate()}일
          ({WEEKDAYS_KO[value.getDay()]})
        </span>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsPickerOpen((prev) => !prev)}
          aria-label="달력 열기"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/[.06] sm:h-7 sm:w-7 dark:hover:bg-white/[.08]"
        >
          <span className="relative aspect-square h-4 w-4 sm:h-5 sm:w-5">
            <Image
              src={calendarIcon}
              alt="달력"
              fill
              className="object-contain"
            />
          </span>
        </button>
        {isPickerOpen && (
          <MiniCalendarPicker
            value={value}
            onSelect={(date) => {
              onChange(date);
              setIsPickerOpen(false);
            }}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

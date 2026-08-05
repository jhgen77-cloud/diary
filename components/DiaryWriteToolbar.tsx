"use client";

import Image from "next/image";
import Link from "next/link";
import {
  saveIcon,
  saveSavedIcon,
  calendarIcon,
  wasteBasketIcon,
  imageAttachmentIcon,
  imageAttachmentSavedIcon,
} from "@/lib/diaryIcons";

interface DiaryWriteToolbarProps {
  onSave: () => void;
  onReset: () => void;
  onOpenAttach: () => void;
  saved: boolean;
  hasAttachment: boolean;
}

const actionButtonClass =
  "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-black/[.06] active:scale-95 dark:hover:bg-white/[.08]";

export default function DiaryWriteToolbar({
  onSave,
  onReset,
  onOpenAttach,
  saved,
  hasAttachment,
}: DiaryWriteToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <button type="button" onClick={onSave} className={actionButtonClass}>
        <span className="relative aspect-square h-5 shrink-0 sm:h-6">
          <Image
            src={saved ? saveSavedIcon : saveIcon}
            alt="저장"
            fill
            className="object-contain"
          />
        </span>
        <span className="text-[0.65rem] text-black/70 sm:text-xs dark:text-zinc-300">
          저장
        </span>
      </button>
      <Link href="/diary/calendar" className={actionButtonClass}>
        <span className="relative aspect-square h-5 shrink-0 sm:h-6">
          <Image
            src={calendarIcon}
            alt="달력"
            fill
            className="object-contain"
          />
        </span>
        <span className="text-[0.65rem] text-black/70 sm:text-xs dark:text-zinc-300">
          달력
        </span>
      </Link>
      <button type="button" onClick={onReset} className={actionButtonClass}>
        <span className="relative aspect-square h-5 shrink-0 sm:h-6">
          <Image
            src={wasteBasketIcon}
            alt="삭제"
            fill
            className="object-contain"
          />
        </span>
        <span className="text-[0.65rem] text-black/70 sm:text-xs dark:text-zinc-300">
          삭제
        </span>
      </button>
      <button
        type="button"
        onClick={onOpenAttach}
        className={actionButtonClass}
      >
        <span className="relative aspect-square h-5 shrink-0 sm:h-6">
          <Image
            src={hasAttachment ? imageAttachmentSavedIcon : imageAttachmentIcon}
            alt="사진 첨부"
            fill
            className="object-contain"
          />
        </span>
        <span className="text-[0.65rem] text-black/70 sm:text-xs dark:text-zinc-300">
          첨부
        </span>
      </button>
    </div>
  );
}

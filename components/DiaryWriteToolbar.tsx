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
  onDelete: () => void;
  onOpenAttach: () => void;
  saved: boolean;
  hasAttachment: boolean;
}

const actionButtonClass =
  "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[var(--hover)] active:scale-95";

export default function DiaryWriteToolbar({
  onSave,
  onDelete,
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
        <span className="text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
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
        <span className="text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
          달력
        </span>
      </Link>
      <button type="button" onClick={onDelete} className={actionButtonClass}>
        <span className="relative aspect-square h-5 shrink-0 sm:h-6">
          <Image
            src={wasteBasketIcon}
            alt="삭제"
            fill
            className="object-contain"
          />
        </span>
        <span className="text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
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
        <span className="text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
          첨부
        </span>
      </button>
    </div>
  );
}

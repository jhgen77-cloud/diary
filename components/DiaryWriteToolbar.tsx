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
  /** 수정 화면에서 원본 글(또는 중복 날짜 검사에 쓰는 전체 목록)을 아직 다
   * 불러오지 못한 동안 true — 이때 저장하면 entryId/date가 아직 새 글
   * 기본값이라 수정이 아니라 새 글로 저장되며, 원본과 같은 날짜에 중복
   * 저장되는 문제가 있었습니다(실제로 겪은 문제). 그 동안은 저장 버튼을
   * 눌러도 반응하지 않게 막습니다. */
  saveDisabled?: boolean;
}

const actionButtonClass =
  "flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[var(--hover)] active:scale-95";

export default function DiaryWriteToolbar({
  onSave,
  onDelete,
  onOpenAttach,
  saved,
  hasAttachment,
  saveDisabled = false,
}: DiaryWriteToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className={`${actionButtonClass} ${saveDisabled ? "pointer-events-none opacity-40" : ""}`}
      >
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

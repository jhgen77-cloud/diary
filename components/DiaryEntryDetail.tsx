"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/Modal";
import NoticeDialog from "@/components/NoticeDialog";
import { formatDiaryDate } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntry, removeSavedDiaryEntry } from "@/lib/savedDiaryEntries";
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  wasteBasketIcon,
  writing1Icon,
  questionMarkIcon,
  letterIIcon,
} from "@/lib/diaryIcons";

interface DiaryEntryDetailProps {
  id: string;
}

const iconButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/[.06] active:scale-90 sm:h-9 sm:w-9 dark:hover:bg-white/[.08]";

type DialogState = { type: "none" } | { type: "delete-confirm" } | { type: "delete-done" };

export default function DiaryEntryDetail({ id }: DiaryEntryDetailProps) {
  const router = useRouter();
  const entry = useSavedDiaryEntry(id);
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });

  function handleDeleteClick() {
    setDialog({ type: "delete-confirm" });
  }

  function handleConfirmDelete() {
    removeSavedDiaryEntry(id);
    setDialog({ type: "delete-done" });
  }

  function handleCancelDelete() {
    setDialog({ type: "none" });
  }

  function handleAcknowledgeDeleted() {
    setDialog({ type: "none" });
    router.back();
  }

  function handleEditClick() {
    router.push(`/diary/write?edit=${id}`);
  }

  if (!entry) {
    return (
      <Modal title="그날을 거닐다" size="sm">
        <p className="text-sm text-black/60 sm:text-base dark:text-zinc-400">
          일기를 찾을 수 없습니다. 삭제되었거나 잘못된 링크일 수 있습니다.
        </p>
      </Modal>
    );
  }

  const { year, month, day, weekday } = formatDiaryDate(entry.date);
  const deleteDateLabel = `${year}년 ${month}월 ${day}일 ${weekday}요일`;

  const createdAt = new Date(entry.createdAt);
  const createdLabel = `${createdAt.getFullYear()}년 ${createdAt.getMonth() + 1}월 ${createdAt.getDate()}일 ${String(
    createdAt.getHours()
  ).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}에 작성된 일기입니다.`;

  return (
    <>
      <Modal title="그날을 거닐다" size="lg" tall>
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex shrink-0 items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-black/70 sm:text-base dark:text-zinc-300">
                {year}년 {month}월 {day}일 ({weekday})
              </p>
              <div className="flex items-center gap-1.5">
                <span className="relative h-6 w-6 shrink-0 sm:h-7 sm:w-7">
                  <Image
                    src={MOOD_ICONS[entry.mood]}
                    alt={entry.mood}
                    fill
                    className="object-contain"
                  />
                </span>
                {entry.weather && (
                  <span className="relative h-6 w-6 shrink-0 sm:h-7 sm:w-7">
                    <Image
                      src={WEATHER_ICONS[entry.weather]}
                      alt={entry.weather}
                      fill
                      className="object-contain"
                    />
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleDeleteClick}
                aria-label="삭제"
                className={iconButtonClass}
              >
                <span className="relative h-4 w-4 sm:h-5 sm:w-5">
                  <Image
                    src={wasteBasketIcon}
                    alt="삭제"
                    fill
                    className="object-contain"
                  />
                </span>
              </button>
              <button
                type="button"
                onClick={handleEditClick}
                aria-label="수정"
                className={iconButtonClass}
              >
                <span className="relative h-4 w-4 sm:h-5 sm:w-5">
                  <Image
                    src={writing1Icon}
                    alt="수정"
                    fill
                    className="object-contain"
                  />
                </span>
              </button>
            </div>
          </div>

          <p className="shrink-0 truncate text-lg font-semibold text-black sm:text-xl dark:text-zinc-50">
            {entry.title}
          </p>

          <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-black/[.06] p-3 sm:p-4 dark:border-white/[.08]">
            <div className="min-h-0 flex-1 overflow-y-auto text-sm whitespace-pre-wrap text-black sm:text-base dark:text-zinc-50">
              {entry.content}
            </div>
            <p className="shrink-0 pt-2 text-left text-[0.7rem] text-black/40 sm:text-xs dark:text-zinc-500">
              {createdLabel}
            </p>
          </div>
        </div>
      </Modal>

      {dialog.type === "delete-confirm" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message={`${deleteDateLabel} 일기를 삭제합니다.\n계속 진행하시겠습니까?`}
          confirmLabel="예"
          onConfirm={handleConfirmDelete}
          cancelLabel="아니요"
          onCancel={handleCancelDelete}
          confirmFirst
          wide
        />
      )}
      {dialog.type === "delete-done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="삭제되었습니다."
          onConfirm={handleAcknowledgeDeleted}
        />
      )}
    </>
  );
}

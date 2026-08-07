"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/Modal";
import NoticeDialog from "@/components/NoticeDialog";
import DiaryEntryImages from "@/components/DiaryEntryImages";
import { FONT_FAMILY_CSS } from "@/components/FontFamilySelect";
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

// 기분/날씨 아이콘(래핑 없는 순수 아이콘 크기)과 바깥 테두리를 맞추기 위해
// 버튼 자체를 같은 크기(h-7/h-8)로 맞췄습니다.
const iconButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/[.06] active:scale-90 sm:h-8 sm:w-8 dark:hover:bg-white/[.08]";

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
    // 찾을 수 없는 글(이미 삭제됐거나 잘못된 링크)도 실제 삭제 흐름과 같은
    // "삭제되었습니다." 알림창으로 안내합니다.
    return (
      <NoticeDialog
        icon={letterIIcon}
        message="삭제되었습니다."
        onConfirm={() => router.back()}
      />
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
      <Modal title="그날을 거닐다" size="xl" tall>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-start justify-between gap-3 rounded-2xl border border-black/[.06] p-2 sm:p-2.5 dark:border-white/[.08]">
            {/* 좌측: 기분/날씨 아이콘 → 제목, 우측: 삭제/수정 아이콘 → 날짜 — 같은
                구조(아이콘 줄 + 텍스트, gap-1)로 맞춰서 상하 간격이 정확히 동일합니다. */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                  <Image
                    src={MOOD_ICONS[entry.mood]}
                    alt={entry.mood}
                    fill
                    className="object-contain"
                  />
                </span>
                {entry.weather && (
                  <span className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                    <Image
                      src={WEATHER_ICONS[entry.weather]}
                      alt={entry.weather}
                      fill
                      className="object-contain"
                    />
                  </span>
                )}
              </div>
              {/* "시간을 붙잡다"에서 저장된 폰트명/색상을 그대로 재현합니다
                 (요구사항 — 저장 시 반영된 값이 나중에 볼 때도 보여야 함).
                 titleStyle이 없는(다른 경로로 만든) 일기는 기본 스타일 그대로. */}
              <p
                style={{
                  fontFamily: entry.titleStyle
                    ? FONT_FAMILY_CSS[entry.titleStyle.fontFamily]
                    : undefined,
                  color: entry.titleStyle?.fontColor,
                }}
                className="truncate text-lg font-semibold text-black sm:text-xl dark:text-zinc-50"
              >
                {entry.title}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  aria-label="삭제"
                  className={iconButtonClass}
                >
                  <span className="relative h-7 w-7 sm:h-8 sm:w-8">
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
                  <span className="relative h-7 w-7 sm:h-8 sm:w-8">
                    <Image
                      src={writing1Icon}
                      alt="수정"
                      fill
                      className="object-contain"
                    />
                  </span>
                </button>
              </div>
              <p className="text-sm whitespace-nowrap text-black/70 sm:text-base dark:text-zinc-300">
                {year}년 {month}월 {day}일 ({weekday})
              </p>
            </div>
          </div>

          {/* 이미지+본문은 안쪽 스크롤 영역으로 묶었습니다(이전엔 본문 텍스트만
             별도의 flex-1 영역에 욱여넣어서, 고정 높이 이미지가 공간을 차지하면
             본문 영역이 0에 가깝게 눌려 텍스트가 안 보이는 문제가 있었습니다).
             작성 일시 캡션은 그 바깥(shrink-0)에 따로 둬서, 본문이 짧을 때도 늘
             박스 좌측 하단에 고정되고, 내용이 길어 스크롤될 때도 함께 스크롤되어
             사라지지 않고 항상 보입니다. */}
          {/* 본문 배경(단색일 때)도 저장된 그대로 재현합니다. */}
          <div
            style={{
              backgroundColor:
                entry.contentStyle?.backgroundType === "solid"
                  ? entry.contentStyle.backgroundColor
                  : undefined,
            }}
            className="flex min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-black/[.06] p-3 sm:p-4 dark:border-white/[.08]"
          >
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
              <DiaryEntryImages images={entry.images} />
              <div
                style={{
                  fontFamily: entry.contentStyle
                    ? FONT_FAMILY_CSS[entry.contentStyle.fontFamily]
                    : undefined,
                  fontSize: entry.contentStyle ? `${entry.contentStyle.fontSize}px` : undefined,
                  color: entry.contentStyle?.fontColor,
                  textAlign: entry.contentStyle?.textAlign,
                }}
                className="text-sm whitespace-pre-wrap text-black sm:text-base dark:text-zinc-50"
              >
                {entry.content}
              </div>
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

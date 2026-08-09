"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Modal from "@/components/Modal";
import NoticeDialog from "@/components/NoticeDialog";
import DiaryEntryImages from "@/components/DiaryEntryImages";
import { FONT_FAMILY_CSS } from "@/components/FontFamilySelect";
import { formatDiaryDate, isDiaryEntryEditable } from "@/lib/mockDiaryEntries";
import { useSavedDiaryEntry } from "@/lib/savedDiaryEntries";
import { useRemoteMemoryEntry, deleteDiaryEntryEverywhere } from "@/lib/memoryEntries";
import { useUnlockedKey } from "@/lib/diaryEncryptionKey";
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  wasteBasketIcon,
  writing1Icon,
  questionMarkIcon,
  letterIIcon,
  warningSignIcon,
} from "@/lib/diaryIcons";

interface DiaryEntryDetailProps {
  id: string;
}

// 기분/날씨 아이콘(래핑 없는 순수 아이콘 크기)과 바깥 테두리를 맞추기 위해
// 버튼 자체를 같은 크기(h-7/h-8)로 맞췄습니다.
const iconButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] active:scale-90 sm:h-8 sm:w-8";

type DialogState = { type: "none" } | { type: "delete-confirm" } | { type: "delete-done" };

export default function DiaryEntryDetail({ id }: DiaryEntryDetailProps) {
  const router = useRouter();
  const localEntry = useSavedDiaryEntry(id);
  // 로컬(이 탭에서 저장한 글)에 없으면 Supabase에서 읽어온 글일 수 있어
  // 그쪽도 확인합니다 — 로컬에 있으면 굳이 원격 조회를 하지 않도록 id 대신
  // null을 넘겨 훅을 쉬게 둡니다.
  const { entry: remoteEntry, loading: remoteLoading } = useRemoteMemoryEntry(
    localEntry ? null : id
  );
  const entry = localEntry ?? remoteEntry;
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  // 암호화된 글인지와 무관하게 항상 구독합니다(훅은 조건부로 호출할 수
  // 없음) — 아래에서 entry.encrypted와 함께 봐야만 "잠긴 암호화 글"인지
  // 판단할 수 있습니다.
  const encryptionKey = useUnlockedKey();

  function handleDeleteClick() {
    setDialog({ type: "delete-confirm" });
  }

  async function handleConfirmDelete() {
    // 로컬 사본과, (원격 글이거나 이번 세션에 Supabase로도 동기화된 로컬
    // 글이면) Supabase 쪽까지 함께 지웁니다.
    await deleteDiaryEntryEverywhere(id);
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
    // Supabase 원격 글은 조회가 끝나기 전까지 잠깐 못 찾은 것처럼 보일 수
    // 있어, 그 동안은 "삭제되었습니다" 대신 빈 모달만 보여주고 기다립니다.
    if (remoteLoading) {
      return <Modal title="그날을 거닐다" size="xl" tall>{null}</Modal>;
    }
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

  // 암호화된 글인데 이번 세션에 "일기 암호"를 아직 안 풀었으면, 작성자
  // 본인이어도 내용을 복호화할 방법이 없습니다(lib/decryptDiaryEntry.ts가
  // 이미 title을 "🔒 암호로 보호된 일기" 자리표시자로 바꿔둔 상태) —
  // 그 자리표시자만 덩그러니 보여주는 대신, 왜 안 보이는지와 어떻게
  // 풀 수 있는지 명확히 안내합니다. 암호화되지 않은 일반 글에는 전혀
  // 영향이 없습니다.
  if (entry.encrypted && !encryptionKey) {
    return (
      <>
        <Modal title="그날을 거닐다" size="xl" tall closeHref="/">
          {null}
        </Modal>
        <NoticeDialog
          icon={warningSignIcon}
          message={"암호화된 일기입니다.\n일기 보기 암호를 풀어야 읽을 수 있습니다."}
          confirmLabel="환경설정으로"
          onConfirm={() => router.push("/settings")}
          cancelLabel="닫기"
          onCancel={() => router.back()}
          wide
        />
      </>
    );
  }

  const { year, month, day, weekday } = formatDiaryDate(entry.date);
  const deleteDateLabel = `${year}년 ${month}월 ${day}일 ${weekday}요일`;

  const createdAt = new Date(entry.createdAt);
  const createdLabel = `${createdAt.getFullYear()}년 ${createdAt.getMonth() + 1}월 ${createdAt.getDate()}일 ${String(
    createdAt.getHours()
  ).padStart(2, "0")}:${String(createdAt.getMinutes()).padStart(2, "0")}에 작성된 일기입니다.`;

  // 한 번이라도 고쳐 저장한 적 있으면 최종 수정 시각을 함께 보여줘 원본이
  // 바뀌었음을 알립니다.
  const updatedAt = entry.updatedAt ? new Date(entry.updatedAt) : null;
  const updatedLabel = updatedAt
    ? `${updatedAt.getFullYear()}년 ${updatedAt.getMonth() + 1}월 ${updatedAt.getDate()}일 ${String(
        updatedAt.getHours()
      ).padStart(2, "0")}:${String(updatedAt.getMinutes()).padStart(2, "0")}에 수정되었습니다.`
    : null;

  // 작성 당일에만 수정할 수 있습니다(정책) — 지난 글은 수정 아이콘을 눌러도
  // 반응하지 않게 막습니다(DiaryWriteForm도 이중으로 한 번 더 막음).
  const editable = isDiaryEntryEditable(entry);

  return (
    <>
      <Modal title="그날을 거닐다" size="xl" tall>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex shrink-0 items-start justify-between gap-3 rounded-2xl border border-[var(--border)] p-2 sm:p-2.5">
            {/* 좌측: 기분/날씨 아이콘 → 제목, 우측: 삭제/수정 아이콘 → 날짜 — 같은
                구조(아이콘 줄 + 텍스트, gap-1)로 맞춰서 상하 간격이 정확히 동일합니다. */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="relative h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                  <Image src={MOOD_ICONS[entry.mood]} alt={entry.mood} fill className="object-contain" />
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
                className="truncate text-lg font-semibold text-[var(--text)] sm:text-xl"
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
                  disabled={!editable}
                  aria-label="수정"
                  aria-disabled={!editable}
                  title={editable ? undefined : "작성 당일에만 수정할 수 있습니다."}
                  className={`${iconButtonClass} ${!editable ? "pointer-events-none opacity-40" : ""}`}
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
              <p className="text-sm whitespace-nowrap text-[var(--text-sub)] sm:text-base">
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
            className="flex min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-[var(--border)] p-3 sm:p-4"
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
                className="text-sm whitespace-pre-wrap text-[var(--text)] sm:text-base"
              >
                {entry.content}
              </div>
            </div>
            <p className="shrink-0 pt-2 text-left text-[0.7rem] text-[var(--text-sub)] sm:text-xs">
              {createdLabel}
            </p>
            {updatedLabel && (
              <p className="shrink-0 text-left text-[0.7rem] text-[var(--accent)] sm:text-xs">
                {updatedLabel}
              </p>
            )}
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

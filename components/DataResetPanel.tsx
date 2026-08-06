"use client";

import { useState } from "react";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon, questionMarkIcon } from "@/lib/diaryIcons";
import { clearSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

type DialogState = "none" | "confirm" | "done";

/** 기억의 소멸 — 저장된 데이터 초기화. */
export default function DataResetPanel() {
  const entries = useSavedDiaryEntries();
  const [dialog, setDialog] = useState<DialogState>("none");

  function handleConfirmReset() {
    clearSavedDiaryEntries();
    setDialog("done");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        저장된 모든 일기 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.
      </p>

      <div className="flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
        <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
          현재 저장된 일기 {entries.length}개가 모두 삭제됩니다.
        </p>
        <button
          type="button"
          onClick={() => setDialog("confirm")}
          disabled={entries.length === 0}
          className="mt-1 self-start rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:bg-white dark:text-black"
        >
          초기화
        </button>
      </div>

      {dialog === "confirm" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message={`저장된 일기 ${entries.length}개를 모두 삭제합니다.\n계속 진행하시겠습니까?`}
          confirmLabel="예"
          onConfirm={handleConfirmReset}
          cancelLabel="아니요"
          onCancel={() => setDialog("none")}
          confirmFirst
          wide
        />
      )}
      {dialog === "done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="초기화되었습니다."
          onConfirm={() => setDialog("none")}
        />
      )}
    </div>
  );
}

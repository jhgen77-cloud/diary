"use client";

import { useState } from "react";
import DataCheckboxOption from "@/components/DataCheckboxOption";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon, questionMarkIcon } from "@/lib/diaryIcons";
import { clearSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

type DialogState = "none" | "confirm" | "done";

/** 기억의 소멸 — 데이터가 저장되는 곳('기억의 은하')을 보여주고, 그 데이터를 모두
 * 초기화(소멸)합니다. '모든 데이터를 삭제합니다.' 체크박스에 동의해야만 [소멸]
 * 버튼이 활성화됩니다. */
export default function DataResetPanel() {
  const entries = useSavedDiaryEntries();
  const [agreed, setAgreed] = useState(false);
  const [dialog, setDialog] = useState<DialogState>("none");

  function handleConfirmReset() {
    clearSavedDiaryEntries();
    setAgreed(false);
    setDialog("done");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        저장된 모든 일기 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.
      </p>

      {/* 기억의 은하 — 데이터가 실제로 저장되는 곳. 아직 데이터베이스가 없어,
         지금은 브라우저 로컬 저장소를 임시로 쓰고 있음을 경로 자리에 표기합니다. */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
        <p className="shrink-0 text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
          기억의 은하
        </p>
        <span className="truncate rounded-lg bg-black/[.04] px-2 py-1 font-mono text-[0.7rem] text-black/60 sm:text-xs dark:bg-white/[.06] dark:text-zinc-400">
          (데이터베이스 미구현) 브라우저 로컬 저장소 · diary:savedEntries
        </span>
      </div>

      {/* 기억의 소멸 — 체크박스로 삭제 의사를 확인받은 뒤에만 [소멸] 버튼이
         활성화됩니다. */}
      <div className="flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="shrink-0 text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
              기억의 소멸
            </p>
            <DataCheckboxOption
              label="모든 데이터를 삭제합니다."
              checked={agreed}
              onChange={() => setAgreed((prev) => !prev)}
            />
          </div>
          <button
            type="button"
            onClick={() => setDialog("confirm")}
            disabled={!agreed || entries.length === 0}
            className="shrink-0 rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:bg-white dark:text-black"
          >
            소멸
          </button>
        </div>
        <p className="text-xs text-black/60 sm:text-sm dark:text-zinc-400">
          현재 저장된 일기 {entries.length}개가 모두 삭제됩니다.
        </p>
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
          message="모든 데이터가 소멸되었습니다."
          onConfirm={() => setDialog("none")}
        />
      )}
    </div>
  );
}

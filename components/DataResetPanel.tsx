"use client";

import { useState } from "react";
import DataCheckboxOption from "@/components/DataCheckboxOption";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon, questionMarkIcon } from "@/lib/diaryIcons";
import { clearSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

type DialogState = "none" | "confirm" | "done" | "empty";

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

  // 삭제할 데이터가 없으면 확인 절차 없이 바로 '데이터 없음' 알림만 띄웁니다.
  function handleResetClick() {
    setDialog(entries.length === 0 ? "empty" : "confirm");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* 기억의 은하 — 데이터가 실제로 저장되는 곳. 아직 데이터베이스가 없어,
         지금은 브라우저 로컬 저장소를 임시로 쓰고 있음을 경로 자리에 표기합니다.
         테두리 박스는 '기억의 은하' 텍스트에만 한정합니다. */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:px-5 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300">
          기억의 은하
        </span>
        <span className="truncate text-xs text-black/60 sm:text-sm dark:text-zinc-400">
          (데이터베이스 미구현) 브라우저 로컬 저장소 · diary:savedEntries
        </span>
      </div>

      {/* 기억의 소멸 — 체크박스로 삭제 의사를 확인받은 뒤에만 [소멸] 버튼이
         활성화됩니다. 테두리 박스는 '기억의 소멸' 텍스트에만 한정합니다. */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:px-5 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300">
              기억의 소멸
            </span>
            <DataCheckboxOption
              label="모든 데이터를 삭제합니다."
              checked={agreed}
              onChange={() => setAgreed((prev) => !prev)}
            />
          </div>
          <button
            type="button"
            onClick={handleResetClick}
            disabled={!agreed}
            className="shrink-0 rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:bg-white dark:text-black"
          >
            소멸
          </button>
        </div>
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
          message="데이터베이스 초기화가 완료되었습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
      {dialog === "empty" && (
        <NoticeDialog
          icon={letterIIcon}
          message="초기화 할 데이터가 없습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon } from "@/lib/diaryIcons";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

/** 기억의 날개 — 저장된 데이터를 ZIP/XML 파일로 내보내 백업. */
export default function DataExportPanel() {
  const entries = useSavedDiaryEntries();
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        저장된 일기를 ZIP 및 XML 파일로 내보내 백업합니다.
      </p>

      <div className="flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
        <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
          현재 저장된 일기 {entries.length}개를 내보냅니다.
        </p>
        <button
          type="button"
          onClick={() => setShowNotice(true)}
          className="mt-1 self-start rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 sm:text-sm dark:bg-white dark:text-black"
        >
          내보내기
        </button>
      </div>

      {showNotice && (
        <NoticeDialog
          icon={letterIIcon}
          message="데이터 내보내기 기능은 아직 준비 중입니다."
          onConfirm={() => setShowNotice(false)}
        />
      )}
    </div>
  );
}

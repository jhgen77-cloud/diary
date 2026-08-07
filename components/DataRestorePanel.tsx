"use client";

import { useRef, useState } from "react";
import DataOptionRadio from "@/components/DataOptionRadio";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon, questionMarkIcon, warningSignIcon } from "@/lib/diaryIcons";
import { setSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import {
  mergeImportedEntries,
  readImportFile,
  type ImportOption,
} from "@/lib/importDiaryEntries";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface ImportOptionItem {
  key: ImportOption;
  label: string;
}

const IMPORT_OPTIONS: ImportOptionItem[] = [
  { key: "skip", label: "가져오기 하지 않고 건너뜀" },
  { key: "overwrite-newer", label: "최종 수정 일시가 최근 날짜인 일기로 덮어 쓰기" },
  { key: "overwrite-source", label: "가져오기 대상 파일에 존재하는 일기의 내용으로 덮어쓰기" },
];

type DialogState =
  | "none"
  | "conflictToast" // skip: 같은 날짜가 있어 건너뛰었음을 잠깐 알림
  | "confirmOverwrite" // overwrite-newer: 덮어쓰기 전 확인
  | "done"
  | "noEntries"
  | "error";

/** 기억의 귀환 — 백업된 데이터(ZIP/XML) 가져오기. 같은 날짜의 일기가 이미 저장돼
 * 있으면, 선택한 옵션에 따라 건너뛰거나(skip) 덮어씁니다(overwrite-*). */
export default function DataRestorePanel() {
  const entries = useSavedDiaryEntries();
  const [option, setOption] = useState<ImportOption>("skip");
  const [dialog, setDialog] = useState<DialogState>("none");
  // overwrite-newer는 확인을 받기 전까지 실제로 저장하지 않고 대기시켜 둡니다.
  const pendingNextRef = useRef<DiaryEntry[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 선택해도 onChange가 다시 일어나게
    if (!file) return;

    try {
      const imported = await readImportFile(file);
      if (imported.length === 0) {
        setDialog("noEntries");
        return;
      }

      const { next, hasConflict } = mergeImportedEntries(entries, imported, option);

      if (option === "overwrite-newer" && hasConflict) {
        pendingNextRef.current = next;
        setDialog("confirmOverwrite");
        return;
      }

      setSavedDiaryEntries(next);
      setDialog(option === "skip" && hasConflict ? "conflictToast" : "done");
    } catch (error) {
      console.error("가져오기 실패", error);
      setDialog("error");
    }
  }

  function handleConfirmOverwrite() {
    if (pendingNextRef.current) setSavedDiaryEntries(pendingNextRef.current);
    pendingNextRef.current = null;
    setDialog("done");
  }

  function handleCancelOverwrite() {
    pendingNextRef.current = null;
    setDialog("none");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        ZIP 및 XML 파일로 백업한 일기로부터 데이터를 가져와서 저장합니다.
      </p>

      <div className="relative flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 pt-4 dark:border-white/[.08]">
        <p className="absolute -top-2.5 left-3 bg-zinc-50 px-1 text-xs font-semibold text-black sm:text-sm dark:bg-zinc-900 dark:text-zinc-50">
          가져오기 옵션 선택
        </p>
        <p className="text-xs text-black/60 sm:text-sm dark:text-zinc-400">
          같은 날짜의 일기가 존재하는 경우 처리 방법을 선택하세요.
        </p>
        <div role="radiogroup" aria-label="가져오기 옵션" className="flex flex-col">
          {IMPORT_OPTIONS.map((item) => (
            <DataOptionRadio
              key={item.key}
              label={item.label}
              selected={option === item.key}
              onSelect={() => setOption(item.key)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleImportClick}
          className="mt-1 self-end rounded-full bg-black px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90 sm:text-sm dark:bg-white dark:text-black"
        >
          가져오기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {dialog === "conflictToast" && (
        <NoticeDialog
          icon={letterIIcon}
          message="같은 날짜의 일기가 존재합니다."
          onConfirm={() => setDialog("none")}
          autoDismissMs={1800}
        />
      )}
      {dialog === "confirmOverwrite" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message="내용을 덮어 쓰기 할까요?"
          confirmLabel="확인"
          onConfirm={handleConfirmOverwrite}
          cancelLabel="취소"
          onCancel={handleCancelOverwrite}
          confirmFirst
        />
      )}
      {dialog === "done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="가져오기를 완료했습니다."
          onConfirm={() => setDialog("none")}
        />
      )}
      {dialog === "noEntries" && (
        <NoticeDialog
          icon={letterIIcon}
          message="가져올 일기를 찾지 못했습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
      {dialog === "error" && (
        <NoticeDialog
          icon={warningSignIcon}
          message="파일을 가져오는 중 오류가 발생했습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import DataOptionRadio from "@/components/DataOptionRadio";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon } from "@/lib/diaryIcons";

type ImportOptionKey = "skip" | "overwrite-newer" | "overwrite-source";

interface ImportOption {
  key: ImportOptionKey;
  label: string;
}

const IMPORT_OPTIONS: ImportOption[] = [
  { key: "skip", label: "가져오기 하지 않고 건너뜀" },
  { key: "overwrite-newer", label: "최종 수정 일시가 최근 날짜인 일기로 덮어 쓰기" },
  { key: "overwrite-source", label: "가져오기 대상 파일에 존재하는 일기의 내용으로 덮어쓰기" },
];

/** 기억의 귀환 — 백업된 데이터(ZIP/XML) 가져오기. */
export default function DataRestorePanel() {
  const [option, setOption] = useState<ImportOptionKey>("skip");
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // 같은 파일을 다시 선택해도 onChange가 다시 일어나게
    if (file) setPendingFileName(file.name);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        ZIP 및 XML 파일로 백업한 일기로부터 데이터를 가져와서 저장합니다.
      </p>

      <div className="flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
        <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
          가져오기 옵션 선택
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

      {pendingFileName && (
        <NoticeDialog
          icon={letterIIcon}
          message={`'${pendingFileName}' 파일을 선택하신 옵션으로 가져오는 기능은 아직 준비 중입니다.`}
          onConfirm={() => setPendingFileName(null)}
          wide
        />
      )}
    </div>
  );
}

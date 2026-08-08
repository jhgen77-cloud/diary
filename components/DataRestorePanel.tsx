"use client";

import { useRef, useState } from "react";
import DataOptionRadio from "@/components/DataOptionRadio";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon, warningSignIcon } from "@/lib/diaryIcons";
import { setSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import {
  mergeImportedEntries,
  readImportFiles,
  type ImportOption,
} from "@/lib/importDiaryEntries";
import {
  useMemoryEntries,
  insertMemoryEntry,
  updateMemoryEntry,
  isRemoteEntryId,
  getSyncedRemoteId,
} from "@/lib/memoryEntries";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

interface ImportOptionItem {
  key: ImportOption;
  label: string;
}

const IMPORT_OPTIONS: ImportOptionItem[] = [
  { key: "skip", label: "가져오기 하지 않고 건너뜀" },
  { key: "overwrite-source", label: "가져오기 대상 파일에 존재하는 일기의 내용으로 덮어쓰기" },
];

type DialogState =
  | { type: "none" }
  | { type: "conflictToast" } // skip: 같은 날짜가 있어 건너뛰었음을 잠깐 알림
  | { type: "done" }
  | { type: "noEntries" }
  | { type: "storageFull" } // 저장 공간 부족으로 반영하지 못하고 중단함
  | { type: "error"; detail: string };

/** 기억의 귀환 — 백업된 데이터(ZIP/XML) 가져오기. 같은 날짜의 일기가 이미 저장돼
 * 있으면, 선택한 옵션에 따라 건너뛰거나(skip) 가져오기 대상 파일의 내용으로
 * 덮어씁니다(overwrite-source — 파일이 나중에 다시 바뀌어도 다시 가져오면 그때마다
 * 최신 내용으로 덮어써집니다). */
export default function DataRestorePanel() {
  const savedEntries = useSavedDiaryEntries();
  // "그날을 거닐다"와 동일하게 Supabase에 저장된 글도 함께 병합 대상에
  // 넣습니다 — 아니면 이미 Supabase에만 있는 글과 같은 날짜를 가져와도
  // 충돌로 인식되지 않아 중복으로 쌓일 수 있었습니다.
  const { entries: remoteEntries } = useMemoryEntries(savedEntries);
  const entries = [...savedEntries, ...remoteEntries];
  const [option, setOption] = useState<ImportOption>("skip");
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    // 드래그로 여러 개 선택하거나 '모두 선택'해도 files에 전부 담겨 들어옵니다.
    const files = Array.from(event.target.files ?? []);
    event.target.value = ""; // 같은 파일(들)을 다시 선택해도 onChange가 다시 일어나게
    if (files.length === 0) return;

    try {
      const imported = await readImportFiles(files);
      if (imported.length === 0) {
        setDialog({ type: "noEntries" });
        return;
      }

      const { next, hasConflict, touched } = mergeImportedEntries(entries, imported, option);
      const saved = setSavedDiaryEntries(next);
      if (!saved) {
        // 저장 공간이 부족해 반영하지 못했습니다 — 기존 데이터는 그대로 유지되며,
        // 가져오기는 진행되지 않은 것으로 간주합니다.
        setDialog({ type: "storageFull" });
        return;
      }
      // 실제로 새로 추가되거나 덮어써진 글만 Supabase에도 반영합니다 — 이미
      // 원격/동기화된 글(같은 글을 다시 가져와 덮어쓴 경우)이면 그 행을
      // 갱신하고, 그 외엔 새 행으로 추가합니다.
      await Promise.all(
        touched.map((entry: DiaryEntry) => {
          const remoteId = isRemoteEntryId(entry.id) ? entry.id : getSyncedRemoteId(entry.id);
          return remoteId ? updateMemoryEntry(remoteId, entry) : insertMemoryEntry(entry);
        })
      );
      setDialog({ type: option === "skip" && hasConflict ? "conflictToast" : "done" });
    } catch (error) {
      // 실패 원인을 화면에도 그대로 보여줘, "왜" 실패했는지 바로 확인할 수 있게 합니다.
      console.error("가져오기 실패", error);
      const detail = error instanceof Error ? error.message : String(error);
      setDialog({ type: "error", detail });
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-[var(--text-sub)] sm:text-sm">
        ZIP 및 XML 파일로 백업한 일기로부터 데이터를 가져와서 저장합니다. 파일
        선택창에서 여러 개의 파일을 드래그하거나 모두 선택하면 한 번에 가져옵니다.
      </p>

      <div className="relative flex flex-col gap-2 rounded-2xl border border-[var(--border)] p-3 pt-4">
        <p className="absolute -top-2.5 left-3 bg-[var(--card)] px-1 text-xs font-semibold text-[var(--text)] sm:text-sm">
          가져오기 옵션 선택
        </p>
        <p className="text-xs text-[var(--text-sub)] sm:text-sm">
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
          className="mt-1 self-end rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] sm:text-sm"
        >
          가져오기
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.xml"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {dialog.type === "conflictToast" && (
        <NoticeDialog
          icon={letterIIcon}
          message="같은 날짜의 일기가 존재합니다."
          onConfirm={() => setDialog({ type: "none" })}
          autoDismissMs={1800}
        />
      )}
      {dialog.type === "done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="가져오기를 완료했습니다."
          onConfirm={() => setDialog({ type: "none" })}
        />
      )}
      {dialog.type === "noEntries" && (
        <NoticeDialog
          icon={letterIIcon}
          message="가져올 일기를 찾지 못했습니다."
          onConfirm={() => setDialog({ type: "none" })}
          wide
        />
      )}
      {dialog.type === "storageFull" && (
        <NoticeDialog
          icon={warningSignIcon}
          message={"저장 공간이 부족하여 가져오기를 진행할 수 없습니다.\n기존 데이터는 변경되지 않았습니다."}
          onConfirm={() => setDialog({ type: "none" })}
          wide
        />
      )}
      {dialog.type === "error" && (
        <NoticeDialog
          icon={warningSignIcon}
          message={`파일을 가져오는 중 오류가 발생했습니다.\n${dialog.detail}`}
          onConfirm={() => setDialog({ type: "none" })}
          wide
        />
      )}
    </div>
  );
}

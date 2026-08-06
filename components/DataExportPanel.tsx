"use client";

import { useMemo, useState } from "react";
import type { StaticImageData } from "next/image";
import NoticeDialog from "@/components/NoticeDialog";
import DataExportFormatOption from "@/components/DataExportFormatOption";
import DataExportSplitOptions, {
  type TxtSplitOption,
} from "@/components/DataExportSplitOptions";
import DataExportDateRangeSection from "@/components/DataExportDateRangeSection";
import { letterIIcon, warningSignIcon } from "@/lib/diaryIcons";
import { removeSavedDiaryEntry, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import {
  type DateValue,
  type ExportFormat,
  exportEntriesAsTxt,
  exportEntriesAsZip,
  filterEntriesByDateRange,
  isDirectoryPickerSupported,
} from "@/lib/exportDiaryEntries";

function toDateValue(date: Date): DateValue {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

interface NoticeState {
  icon: StaticImageData;
  message: string;
}

/** 기억의 날개 — 저장된 일기를 ZIP/TXT 파일로 로컬 폴더에 내보내 백업. */
export default function DataExportPanel() {
  const entries = useSavedDiaryEntries();

  const [format, setFormat] = useState<ExportFormat>("zip");
  const [splitOption, setSplitOption] = useState<TxtSplitOption>("year");
  const [exportAll, setExportAll] = useState(false);
  const [startDate, setStartDate] = useState<DateValue>(() => {
    const earliest = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1))[0];
    return earliest ? toDateValue(new Date(`${earliest.date}T00:00:00`)) : toDateValue(new Date());
  });
  const [endDate, setEndDate] = useState<DateValue>(() => toDateValue(new Date()));
  const [deleteAfterExport, setDeleteAfterExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  // 저장된 일기가 없는 해도 최소 올해는 고를 수 있게 현재 연도를 항상 포함합니다.
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set(entries.map((entry) => Number(entry.date.slice(0, 4))));
    years.add(currentYear);
    return Array.from(years).sort((a, b) => a - b);
  }, [entries]);

  async function handleExport() {
    if (entries.length === 0) {
      setNotice({ icon: letterIIcon, message: "내보낼 일기가 없습니다." });
      return;
    }
    if (!isDirectoryPickerSupported()) {
      setNotice({
        icon: warningSignIcon,
        message:
          "이 브라우저에서는 로컬 폴더로 내보내기를 지원하지 않습니다.\n최신 Chrome, Edge 등에서 이용해 주세요.",
      });
      return;
    }

    const targets = exportAll ? entries : filterEntriesByDateRange(entries, startDate, endDate);
    if (targets.length === 0) {
      setNotice({ icon: letterIIcon, message: "선택한 기간에 내보낼 일기가 없습니다." });
      return;
    }

    let dirHandle: FileSystemDirectoryHandle;
    try {
      dirHandle = await window.showDirectoryPicker!({ mode: "readwrite" });
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return; // 폴더 선택 취소
      setNotice({ icon: warningSignIcon, message: "폴더를 선택하지 못했습니다." });
      return;
    }

    setIsExporting(true);
    try {
      if (format === "zip") {
        await exportEntriesAsZip(dirHandle, targets);
      } else {
        await exportEntriesAsTxt(dirHandle, targets, splitOption);
      }
      if (deleteAfterExport) {
        targets.forEach((entry) => removeSavedDiaryEntry(entry.id));
      }
      setNotice({ icon: letterIIcon, message: `일기 ${targets.length}개를 내보냈습니다.` });
    } catch (error) {
      console.error("내보내기 실패", error);
      setNotice({ icon: warningSignIcon, message: "내보내는 중 오류가 발생했습니다." });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="text-xs text-black/70 sm:text-sm dark:text-zinc-300">
        작성한 글을 외부 파일로 내보내기 합니다.
      </p>

      <div className="relative flex flex-col gap-2 rounded-2xl border border-black/[.06] p-3 pt-4 dark:border-white/[.08]">
        {/* 박스 테두리 선 위에 걸치는 legend 스타일 라벨. 배경색을 모달 배경(Modal.tsx의
           bg-zinc-50/dark:bg-zinc-900)과 맞춰 라벨 아래 테두리 선이 끊겨 보이게 합니다. */}
        <p className="absolute -top-2.5 left-3 bg-zinc-50 px-1 text-xs font-semibold text-black sm:text-sm dark:bg-zinc-900 dark:text-zinc-50">
          파일 형식 선택
        </p>
        <div role="radiogroup" aria-label="파일 형식" className="flex flex-col">
          <DataExportFormatOption
            label="ZIP 파일"
            description="이미지를 포함한 전체 내용을 내보내기 합니다. 나중에 [가져오기]를 통해서 다시 복원할 수 있습니다."
            selected={format === "zip"}
            onSelect={() => setFormat("zip")}
          />
          <DataExportFormatOption
            label="TXT 파일"
            description="이미지를 제외한 텍스트 데이터만 백업합니다. 암호화된 일기는 내보내기 대상에서 제외됩니다."
            selected={format === "txt"}
            onSelect={() => setFormat("txt")}
          >
            <div className="flex items-center gap-2 pt-1">
              <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
                파일 생성 옵션
              </p>
              <DataExportSplitOptions
                value={splitOption}
                onChange={setSplitOption}
                disabled={format !== "txt"}
              />
            </div>
          </DataExportFormatOption>
        </div>
      </div>

      <DataExportDateRangeSection
        startDate={startDate}
        endDate={endDate}
        onChangeStart={setStartDate}
        onChangeEnd={setEndDate}
        exportAll={exportAll}
        onToggleExportAll={() => setExportAll((prev) => !prev)}
        deleteAfterExport={deleteAfterExport}
        onToggleDeleteAfterExport={() => setDeleteAfterExport((prev) => !prev)}
        yearOptions={yearOptions}
        onExport={handleExport}
        exporting={isExporting}
      />

      {notice && (
        <NoticeDialog
          icon={notice.icon}
          message={notice.message}
          onConfirm={() => setNotice(null)}
          wide
        />
      )}
    </div>
  );
}

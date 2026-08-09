"use client";

import { useState } from "react";
import type { StaticImageData } from "next/image";
import NoticeDialog from "@/components/NoticeDialog";
import DataExportFormatOption from "@/components/DataExportFormatOption";
import DataExportSplitOptions, {
  type ExportSplitOption,
} from "@/components/DataExportSplitOptions";
import DataExportDateRangeSection from "@/components/DataExportDateRangeSection";
import { letterIIcon, warningSignIcon } from "@/lib/diaryIcons";
import { useSavedDiaryEntries } from "@/lib/savedDiaryEntries";
import { useMemoryEntriesFull, deleteDiaryEntryEverywhere } from "@/lib/memoryEntries";
import {
  type DateValue,
  type ExportFormat,
  dateToDateValue,
  exportEntriesAsTxt,
  exportEntriesAsZip,
  filterEntriesByDateRange,
  isDirectoryPickerSupported,
} from "@/lib/exportDiaryEntries";

interface NoticeState {
  icon: StaticImageData;
  message: string;
}

/** 기억의 날개 — 저장된 일기를 ZIP/TXT 파일로 로컬 폴더에 내보내 백업. */
export default function DataExportPanel() {
  const savedEntries = useSavedDiaryEntries();
  // "그날을 거닐다"와 동일하게, Supabase에 저장된 글도 함께 내보내기 대상에
  // 포함합니다 — 로컬 글만 대상으로 하면 새로고침 이후엔 내보낼 게 없는
  // 것처럼 보였습니다. 목록 화면(useMemoryEntries)과 달리 본문/첨부까지
  // 실제로 파일에 담아야 해서 useMemoryEntriesFull을 씁니다 — 목록용 조회는
  // text/image 컬럼을 아예 select하지 않아, 로컬 세션에 없는(새로고침 이후
  // Supabase에만 남아있는) 글을 그걸로 내보내면 본문·첨부가 통째로 빈 채로
  // 백업 파일에 담기는 심각한 데이터 유실 문제가 있었습니다(실제로 겪은
  // 문제 — 그 백업을 나중에 다시 가져오면 Supabase 원본까지 빈 본문으로
  // 덮어써짐).
  const { entries: remoteEntries } = useMemoryEntriesFull(savedEntries);
  const entries = [...savedEntries, ...remoteEntries];

  const [format, setFormat] = useState<ExportFormat>("zip");
  // ZIP/TXT 각자 '파일 생성 옵션'을 따로 기억합니다 — 형식을 바꿔도 이전에 고른
  // 분할 방식이 그대로 남아 있도록(TXT 옵션과 동일한 선택지를 ZIP에도 그대로
  // 제공하되, 상태 자체는 서로 독립적으로 둡니다).
  const [zipSplitOption, setZipSplitOption] = useState<ExportSplitOption>("year");
  const [txtSplitOption, setTxtSplitOption] = useState<ExportSplitOption>("year");
  const [exportAll, setExportAll] = useState(false);
  const [startDate, setStartDate] = useState<DateValue>(() => {
    const earliest = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1))[0];
    return earliest
      ? dateToDateValue(new Date(`${earliest.date}T00:00:00`))
      : dateToDateValue(new Date());
  });
  const [endDate, setEndDate] = useState<DateValue>(() => dateToDateValue(new Date()));
  const [deleteAfterExport, setDeleteAfterExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

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
      // exportEntriesAs*가 실제로 파일에 담긴 일기 개수를 돌려줍니다 — "날짜별"
      // 옵션에서 같은 날짜의 중복 글(예전 "수정하면 새 글로 저장되던" 버그로
      // 남은 데이터)을 하나로 정리하고 나면 targets.length보다 적을 수 있어,
      // 안내 문구가 실제 생성된 파일 수와 어긋나지 않도록 이 값을 그대로
      // 씁니다(예전엔 targets.length를 그대로 써서 "3개 파일이 만들어졌는데
      // 4개를 내보냈다"고 잘못 안내하는 문제가 있었습니다).
      const exportedCount =
        format === "zip"
          ? await exportEntriesAsZip(dirHandle, targets, zipSplitOption)
          : await exportEntriesAsTxt(dirHandle, targets, txtSplitOption);
      if (deleteAfterExport) {
        // 로컬 사본뿐 아니라 Supabase 쪽도 함께 지웁니다 — 로컬만 지우면
        // "그날을 거닐다"에 Supabase 사본이 그대로 남아 보이는 문제가
        // 있었습니다(실제로 겪은 문제).
        await Promise.all(targets.map((entry) => deleteDiaryEntryEverywhere(entry.id)));
      }
      setNotice({ icon: letterIIcon, message: `일기 ${exportedCount}개를 내보냈습니다.` });
    } catch (error) {
      console.error("내보내기 실패", error);
      setNotice({ icon: warningSignIcon, message: "내보내는 중 오류가 발생했습니다." });
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <p className="text-xs text-[var(--text-sub)] sm:text-sm">
        작성한 글을 외부 파일로 내보내기 합니다.
      </p>

      <div className="relative flex flex-col gap-1 rounded-2xl border border-[var(--border)] p-2.5 pt-3.5">
        {/* 박스 테두리 선 위에 걸치는 legend 스타일 라벨. 배경색을 모달 배경(Modal.tsx의
           bg-[var(--card)])과 맞춰 라벨 아래 테두리 선이 끊겨 보이게 합니다. */}
        <p className="absolute -top-2.5 left-3 bg-[var(--card)] px-1 text-xs font-semibold text-[var(--text)] sm:text-sm">
          파일 형식 선택
        </p>
        <div role="radiogroup" aria-label="파일 형식" className="flex flex-col">
          <DataExportFormatOption
            label="ZIP 파일"
            description="이미지를 포함한 전체 내용을 내보내기 합니다. 나중에 [가져오기]를 통해서 다시 복원할 수 있습니다."
            selected={format === "zip"}
            onSelect={() => setFormat("zip")}
          >
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <p className="shrink-0 text-xs font-semibold whitespace-nowrap text-[var(--text)] sm:text-sm">
                파일 생성 옵션
              </p>
              <DataExportSplitOptions
                value={zipSplitOption}
                onChange={setZipSplitOption}
                disabled={format !== "zip"}
              />
            </div>
          </DataExportFormatOption>
          <DataExportFormatOption
            label="TXT 파일"
            description="이미지를 제외한 텍스트 데이터만 백업합니다. 암호화된 일기는 내보내기 대상에서 제외됩니다."
            selected={format === "txt"}
            onSelect={() => setFormat("txt")}
          >
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <p className="shrink-0 text-xs font-semibold whitespace-nowrap text-[var(--text)] sm:text-sm">
                파일 생성 옵션
              </p>
              <DataExportSplitOptions
                value={txtSplitOption}
                onChange={setTxtSplitOption}
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

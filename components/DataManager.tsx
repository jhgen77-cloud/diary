"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DataSidebar from "@/components/DataSidebar";
import DataTabNav, { type DataTabKey } from "@/components/DataTabNav";
import DataRestorePanel from "@/components/DataRestorePanel";
import DataExportPanel from "@/components/DataExportPanel";
import DataResetPanel from "@/components/DataResetPanel";

/** 데이터 관리 모달의 본문. 좌측 사이드바("기억의 조율") + 상단 탭(귀환/날개/소멸)
 * + 하단 닫기 버튼으로 구성됩니다. 기본 탭은 백업 데이터를 가져오는 '기억의 귀환'. */
export default function DataManager() {
  const router = useRouter();
  const [tab, setTab] = useState<DataTabKey>("restore");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <DataSidebar />
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <DataTabNav active={tab} onChange={setTab} />
          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "restore" && <DataRestorePanel />}
            {tab === "export" && <DataExportPanel />}
            {tab === "reset" && <DataResetPanel />}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 justify-end border-t border-black/10 pt-3 dark:border-white/15">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-black/10 px-5 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/[.06] sm:text-sm dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

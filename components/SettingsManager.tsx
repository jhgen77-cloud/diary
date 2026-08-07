"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SettingsSidebar from "@/components/SettingsSidebar";
import FontSettingsPanel from "@/components/FontSettingsPanel";
import BackgroundSettingsPanel from "@/components/BackgroundSettingsPanel";
import NoticeDialog from "@/components/NoticeDialog";
import { letterIIcon } from "@/lib/diaryIcons";
import {
  useEnvironmentSettings,
  setEnvironmentSettings,
  type EnvironmentSettings,
} from "@/lib/environmentSettings";

// 세 버튼 모두 색으로 구분하지 않고(요구사항) 같은 중립 스타일을 씁니다 —
// DataManager의 "닫기" 버튼과 같은 톤.
const dialogButtonClass =
  "rounded-full border border-[var(--border)] px-5 py-1.5 text-xs text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] sm:text-sm";

/** 환경 설정 모달의 본문. DataManager와 같은 레이아웃(좌측 사이드바 + 본문)을
 * 재사용하되, 하단은 단순 닫기 버튼 대신 확인/취소/적용 3버튼입니다(요구사항).
 *
 * 폰트설정/배경설정 패널은 이 컴포넌트가 들고 있는 '초안(draft)'만 고칩니다 —
 * 저장소(lib/environmentSettings)에는 바로 쓰지 않습니다. 그래서:
 * - 적용: 초안을 저장소에 반영만 하고 모달은 그대로 둡니다(계속 조정 가능).
 * - 확인: 초안을 저장소에 반영하고 모달을 닫습니다.
 * - 취소: 초안을 저장소에 반영하지 않고(버리고) 모달만 닫습니다 — 지금까지
 *   고친 내용이 실제로는 하나도 반영되지 않습니다. */
export default function SettingsManager() {
  const router = useRouter();
  const persisted = useEnvironmentSettings();
  // 모달을 여는 시점의 저장된 값으로 초안을 시작합니다. 이후 저장소가 바뀌어도
  // (예: 적용을 눌러 스스로 반영한 경우) 이 초안을 다시 덮어쓰지 않습니다 —
  // 사용자가 계속 고쳐나가는 중인 값이라 외부에서 되돌릴 이유가 없습니다.
  const [draft, setDraft] = useState<EnvironmentSettings>(persisted);
  const [showAppliedNotice, setShowAppliedNotice] = useState(false);

  function updateDraft(update: Partial<EnvironmentSettings>) {
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function handleApply() {
    setEnvironmentSettings(draft);
    setShowAppliedNotice(true); // "적용 완료했습니다." 알림 — 요구사항.
  }

  function handleConfirm() {
    setEnvironmentSettings(draft);
    router.back();
  }

  function handleCancel() {
    router.back(); // draft는 저장소에 반영하지 않고 그대로 버립니다.
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <SettingsSidebar />
        {/* FontSettingsPanel도 사이드바와 같은 p-3 테두리 박스라 상단 텍스트
           높이가 자연스럽게 맞아, DataTabNav 때와 달리 별도 여백 보정이
           필요 없습니다. */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          <FontSettingsPanel settings={draft} onChange={updateDraft} />
          <BackgroundSettingsPanel settings={draft} onChange={updateDraft} />
        </div>
      </div>

      <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--border)] pt-3">
        <button type="button" onClick={handleConfirm} className={dialogButtonClass}>
          확인
        </button>
        <button type="button" onClick={handleCancel} className={dialogButtonClass}>
          취소
        </button>
        <button type="button" onClick={handleApply} className={dialogButtonClass}>
          적용
        </button>
      </div>

      {showAppliedNotice && (
        <NoticeDialog
          icon={letterIIcon}
          message="적용 완료했습니다."
          onConfirm={() => setShowAppliedNotice(false)}
          autoDismissMs={1800}
        />
      )}
    </div>
  );
}

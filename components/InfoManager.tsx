"use client";

import { useRouter } from "next/navigation";
import InfoSidebar from "@/components/InfoSidebar";
import InfoContent from "@/components/InfoContent";

/** 정보 모달의 본문. DataManager와 같은 레이아웃(좌측 사이드바 + 본문 +
 * 하단 닫기 버튼)을 재사용합니다(요구사항). 사이드바("버전 정보"/"도움말")는
 * InfoSidebar, 본문은 기존 InfoContent를 그대로 씁니다. */
export default function InfoManager() {
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <InfoSidebar />
        {/* overflow-x-hidden 명시: overflow-y-auto만 있으면 브라우저가 좌우도
           auto로 취급해 세로뿐 아니라 옆으로도 스크롤/드래그가 되어버립니다
           (DataManager/SettingsManager에서 같은 문제를 겪고 고친 것과 동일한
           원인). */}
        <div className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <InfoContent />
        </div>
      </div>

      <div className="flex shrink-0 justify-end border-t border-[var(--border)] pt-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-[var(--border)] px-5 py-1.5 text-xs text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] sm:text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

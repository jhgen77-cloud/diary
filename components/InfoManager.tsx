"use client";

import { useRouter } from "next/navigation";
import InfoBanner from "@/components/InfoBanner";
import InfoSidebar from "@/components/InfoSidebar";
import InfoContent from "@/components/InfoContent";

/** 정보 모달의 본문. DataManager와 같은 레이아웃(좌측 사이드바 + 본문 +
 * 하단 닫기 버튼)을 재사용합니다(요구사항). 사이드바("버전 정보"/"도움말")는
 * InfoSidebar, 본문은 기존 InfoContent를 그대로 씁니다.
 *
 * InfoBanner(대표 이미지)는 모달 맨 위 전체 폭이 아니라, 사이드바 옆(본문
 * 칸 안쪽) 위쪽에 둡니다 — 처음엔 사이드바 위 별도의 줄로 뒀는데, 그러면
 * 세로 공간을 나눠 갖게 되어 사이드바가 원래보다 작아 보이는 문제가
 * 있었습니다(실제로 지적받은 문제). 사이드바와 같은 줄(행)에 있어야
 * 사이드바 자체의 크기는 이미지와 무관하게 원래 그대로 유지됩니다. 이미지
 * 옆엔 앱 이름 "기억"을 나란히 둡니다(요구사항). InfoContent("준비
 * 중입니다")는 그 아래 남는 공간 안에서 items-center/justify-center로
 * 가운데 정렬해, 이미지 크기가 바뀌어도 텍스트 위치가 그 영향을 받지
 * 않게 합니다. */
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
        <div className="scrollbar-hide flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-x-hidden overflow-y-auto">
          <div className="mt-3 flex shrink-0 items-center gap-6 sm:mt-4 sm:gap-10">
            <InfoBanner />
            <span className="text-6xl font-bold text-[var(--text)] sm:text-8xl">
              기억
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <InfoContent />
          </div>
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

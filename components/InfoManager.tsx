"use client";

import { useRouter } from "next/navigation";
import InfoBanner from "@/components/InfoBanner";
import InfoSidebar from "@/components/InfoSidebar";
import InfoContent from "@/components/InfoContent";
import InfoDeveloperCredit from "@/components/InfoDeveloperCredit";

/** 정보 모달의 본문. DataManager와 같은 레이아웃(좌측 사이드바 + 본문 +
 * 하단 닫기 버튼)을 재사용합니다(요구사항). 사이드바("프로그램 정보"/"도움말")는
 * InfoSidebar, 본문은 기존 InfoContent를 그대로 씁니다.
 *
 * InfoBanner(대표 이미지)는 모달 맨 위 전체 폭이 아니라, 사이드바 옆(본문
 * 칸 안쪽) 위쪽에 둡니다 — 처음엔 사이드바 위 별도의 줄로 뒀는데, 그러면
 * 세로 공간을 나눠 갖게 되어 사이드바가 원래보다 작아 보이는 문제가
 * 있었습니다(실제로 지적받은 문제). 사이드바와 같은 줄(행)에 있어야
 * 사이드바 자체의 크기는 이미지와 무관하게 원래 그대로 유지됩니다. 이미지
 * 옆엔 앱 이름 "기억"을 나란히 둡니다(요구사항). InfoContent(버전/소개/
 * 개발자 정보)는 그 행 바로 아래(부모 flex-col의 gap-3)에 이어 붙여,
 * "이미지 밑에" 배치해 달라는 요구사항대로 왼쪽 정렬로 자연스럽게
 * 위치합니다(예전엔 자리표시자 한 줄이라 items-center/justify-center로
 * 가운데 정렬했었는데, 실제 소개 문구가 여러 줄이 되면서 위쪽 정렬이 더
 * 자연스러워 걷어냈습니다). */
export default function InfoManager() {
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex min-h-0 flex-1 gap-3 sm:gap-4">
        <InfoSidebar />
        {/* overflow-hidden(스크롤 없음): 이 칸의 내용(배너/버전/소개 문구/개발자
           표기)은 고정 문구라 DataManager/SettingsManager와 달리 세로로 늘어날
           일이 없어 스크롤이 필요 없습니다. 예전엔 안전장치로 overflow-y-auto를
           뒀는데, heightVh(86)로 고정된 모달 안에서 내용 높이가 뷰포트 크기에
           따라 그 몇 px 안팎을 오가며 아주 살짝 스크롤 가능한 상태가 됐다
           안 됐다 해서, 트랙패드/마우스 휠 입력에 화면(특히 가운데 정렬된
           소개 문구)이 위아래로 미세하게 흔들려 보이는 문제가 있었습니다
           (실제로 지적받은 문제). 내용이 원래 한 페이지 안에 들어오도록 짜여
           있으므로(요구사항) 스크롤 자체를 없애 이 흔들림을 막습니다. */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          {/* mt-2: InfoSidebar의 자기 테두리 상자 위 여백(my-2, 항상 8px)과 같은
             값으로 맞춰, 이미지(InfoBanner) 상단이 사이드바 상단 테두리선과
             같은 높이에서 시작하게 합니다(요구사항). */}
          <div className="mt-2 flex shrink-0 items-center gap-6 sm:gap-10">
            <InfoBanner />
            <span className="text-6xl font-bold text-[var(--text)] sm:text-8xl">
              기억
            </span>
          </div>
          <InfoContent />
          <InfoDeveloperCredit />
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

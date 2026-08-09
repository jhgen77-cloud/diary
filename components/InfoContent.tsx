import Image from "next/image";
import updateIcon from "@/images/update.png";

/** 정보 모달의 프로그램 소개 문구(요구사항: 현재 버전/소개 정보를 배너
 * 이미지 밑에 표시). InfoManager가 배너+"기억" 글자 행 바로 아래에 이어
 * 붙여, 왼쪽 정렬로 자연스럽게 이미지 밑에 위치하게 둡니다. ml-4/sm:ml-6은
 * 왼쪽 가장자리(이미지·사이드바)에 바로 붙지 않도록 살짝 우측으로 옮겨
 * 배치해 달라는 요구사항을 반영한 것입니다.
 *
 * 세 줄(버전/소개 두 줄) 모두 하나의 flex-col에 같은 gap을 줘서 상하
 * 간격을 균일하게 맞췄습니다(전엔 버전↔소개 사이 gap-3, 소개 두 줄 사이
 * gap-1로 서로 달랐습니다). 소개 두 줄은 ml-5/sm:ml-6을 더 줘서 버전
 * 줄보다 살짝 더 오른쪽으로 들여씁니다(요구사항).
 *
 * "프로그램 버전 : 1.0" 줄만 좌측/위로 살짝 옮겨 달라는 요구사항이 있어,
 * 문서 흐름(margin/gap)이 아니라 transform(-translate-x/-translate-y)으로
 * 옮겼습니다 — margin으로 옮기면 gap 계산에 끼어들어 아래 소개 두 줄까지
 * 같이 밀리므로, 이 줄만 시각적으로 이동하고 레이아웃엔 영향이 없게
 * 했습니다. 버전 아이콘(update.png)은 텍스트와 같은 줄에 나란히 두고, 이
 * transform도 아이콘을 감싼 바깥 flex 행에 줘서 아이콘과 텍스트가 함께
 * 움직입니다.
 *
 * 소개 두 줄도 마찬가지로 자신만 아래/우측으로 더 옮겨 달라는 요구사항이
 * 있어, 두 줄을 감싼 바깥 div에 translate-x/translate-y를 줬습니다 —
 * gap-2(줄 사이 간격)은 그대로 유지한 채 두 줄이 통째로 함께 이동합니다.
 *
 * 개발자 표기는 여기 없습니다 — 좌측 사이드바 하단에 맞춰 달라는
 * 요구사항 때문에 InfoDeveloperCredit으로 따로 떼어 InfoManager가 본문
 * 칸 맨 아래(mt-auto)에 배치합니다.
 * app/@modal/(.)info/page.tsx와 app/info/page.tsx가 이 컴포넌트를 공유해서
 * 쓰므로, 문구를 고칠 때도 한 곳만 고치면 됩니다. */
export default function InfoContent() {
  return (
    <div className="mt-2 ml-4 flex flex-col gap-2 sm:mt-3 sm:ml-6">
      <div className="-translate-x-2 -translate-y-1 flex items-center gap-1.5 sm:-translate-x-3">
        <Image
          src={updateIcon}
          alt=""
          className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
        />
        <p className="text-sm font-semibold break-keep text-[var(--text-sub)] sm:text-base">
          프로그램 버전 : 1.0
        </p>
      </div>
      <div className="flex translate-x-1 translate-y-2 flex-col gap-2 sm:translate-x-1.5 sm:translate-y-3">
        <p className="ml-5 text-sm break-keep text-[var(--text-sub)] sm:ml-6 sm:text-base">
          &apos;기억&apos;은 일기장 앱으로 일기의 시적인 의미를 담아 표현한 것입니다.
        </p>
        <p className="ml-5 text-sm break-keep text-[var(--text-sub)] sm:ml-6 sm:text-base">
          &apos;기억&apos;은 누구나 사용할 수 있는 무료 프로그램입니다.
        </p>
      </div>
    </div>
  );
}

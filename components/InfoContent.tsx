import Image from "next/image";
import updateIcon from "@/images/update.png";
import InfoIntroText from "@/components/InfoIntroText";

/** 정보 모달의 프로그램 소개 문구(요구사항: 현재 버전/소개 정보를 배너
 * 이미지 밑에 표시). InfoManager가 배너+"기억" 글자 행 바로 아래에 이어
 * 붙여, 왼쪽 정렬로 자연스럽게 이미지 밑에 위치하게 둡니다. ml-4/sm:ml-6은
 * 왼쪽 가장자리(이미지·사이드바)에 바로 붙지 않도록 살짝 우측으로 옮겨
 * 배치해 달라는 요구사항을 반영한 것입니다.
 *
 * 소개 문구(세 줄)는 InfoIntroText로 따로 뗐습니다 — 문구 자체가 자주
 * 바뀌는 부분이라, 버전 표시와 레이아웃만 남은 이 컴포넌트와 분리해 두면
 * 문구 교체 시 이 파일을 건드릴 필요가 없습니다. "중앙 가운데에 배치할
 * 것" 요구사항 때문에 InfoIntroText는 버전 줄과 달리 ml-4/6 안쪽이 아니라
 * 이 div 바로 아래, ml 없는 전체 폭 자리에 형제로 둬서 본문 영역 가로
 * 폭 전체를 기준으로 가운데 정렬되게 합니다(ml-4/6 안에 있으면 그만큼
 * 좁아진 폭 기준으로 가운데 잡혀 실제 본문 중앙과 어긋납니다).
 *
 * "프로그램 버전 : 1.0" 줄만 좌측/위로 살짝 옮겨 달라는 요구사항이 있어,
 * 문서 흐름(margin/gap)이 아니라 transform(-translate-x/-translate-y)으로
 * 옮겼습니다 — margin으로 옮기면 gap 계산에 끼어들어 아래 소개 문구까지
 * 같이 밀리므로, 이 줄만 시각적으로 이동하고 레이아웃엔 영향이 없게
 * 했습니다. 버전 아이콘(update.png)은 텍스트와 같은 줄에 나란히 두고, 이
 * transform도 아이콘을 감싼 바깥 flex 행에 줘서 아이콘과 텍스트가 함께
 * 움직입니다.
 *
 * 개발자 표기는 여기 없습니다 — 좌측 사이드바 하단에 맞춰 달라는
 * 요구사항 때문에 InfoDeveloperCredit으로 따로 떼어 InfoManager가 본문
 * 칸 맨 아래(mt-auto)에 배치합니다.
 * app/@modal/(.)info/page.tsx와 app/info/page.tsx가 이 컴포넌트를 공유해서
 * 쓰므로, 문구를 고칠 때도 한 곳만 고치면 됩니다. */
export default function InfoContent() {
  return (
    <div className="mt-2 flex flex-col sm:mt-3">
      <div className="-translate-x-2 -translate-y-1 ml-4 flex items-center gap-1.5 sm:ml-6 sm:-translate-x-3">
        <Image
          src={updateIcon}
          alt=""
          className="h-4 w-4 shrink-0 sm:h-5 sm:w-5"
        />
        <p className="text-sm font-semibold break-keep text-[var(--text-sub)] sm:text-base">
          프로그램 버전 : 1.0
        </p>
      </div>
      <InfoIntroText />
    </div>
  );
}

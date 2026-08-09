/** 정보 모달의 개발자 표기("개발자 : 임정현 / (주)프라임엔시스템"). 좌측
 * 사이드바(InfoSidebar) 하단에 맞춰 배치해 달라는 요구사항 때문에
 * InfoContent(버전/소개)와 따로 뗀 컴포넌트입니다 — InfoManager의 본문 칸이
 * 사이드바와 같은 행(자동 stretch)에서 같은 높이를 가지므로, 이 컴포넌트를
 * 그 칸 맨 아래에 mt-auto로 붙이면 사이드바 하단과 맞습니다. 다만
 * InfoSidebar는 자신의 테두리 상자를 행 안쪽으로 my-2만큼 띄워두고 있어서
 * (위아래 0.5rem 여백), mt-auto만 쓰면 이 글자가 사이드바 테두리 하단선보다
 * 살짝 더 아래로 처집니다 — mb-2로 그 여백만큼 다시 끌어올려 사이드바
 * 하단선에 정확히 맞춥니다. self-end로 부모 칸의 오른쪽 가장자리에
 * 붙이되, mr-2로 아주 살짝 안쪽(좌측)으로 띄웁니다(요구사항). */
export default function InfoDeveloperCredit() {
  return (
    <p className="mt-auto mr-2 mb-2 shrink-0 self-end text-[0.7rem] break-keep text-[var(--text)] sm:text-xs">
      개발자 : 임정현 / (주)프라임엔시스템
    </p>
  );
}

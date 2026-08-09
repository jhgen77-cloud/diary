import Tooltip from "@/components/Tooltip";

/** 데이터 관리 모달 좌측 사이드바. 지금은 "기억의 조율" 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. 본문(탭+패널) 영역과 구분되도록 사이드바
 * 전체를 하나의 박스로 감쌉니다. */
export default function DataSidebar() {
  // my-2: 옆 탭 영역과 같은 높이로 꽉 늘어나(stretch) 위/아래 경계선에 바로 붙어
  // 있던 것을, 상하로 살짝 여백을 둬 세로 크기를 조금 줄입니다.
  return (
    <aside className="my-2 flex w-16 shrink-0 flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--hover)] p-2 sm:w-28 sm:p-3">
      {/* 사이드바가 모달 왼쪽 가장자리에 붙어 있어, align="start"로 말풍선이
         오른쪽(본문 쪽 여유 공간)으로 펼치게 해 모달 밖으로 벗어나지 않게 합니다.
         좁은 화면(w-16)에서는 "기억의 조율" 다섯 글자가 nowrap으로 다 안 들어와
         옆 본문 쪽으로 삐져나왔던 문제가 있어, 여기서만 줄바꿈을 허용합니다
         (sm 이상은 폭이 넉넉해 원래대로 한 줄로 보여도 됩니다). break-keep으로
         "조율"처럼 한 단어가 중간에서 잘리지 않고 반드시 공백 위치("기억의"
         다음)에서만 줄이 바뀌게 합니다(실제로 "조"/"율"로 쪼개졌던 문제). */}
      {/* Tooltip의 기본 표시(inline-block)는 내용물(가장 넓은 줄인 "기억의")
         너비로만 딱 맞게 줄어들어, text-center를 줘도 그 좁은 상자 안에서는
         눈에 띄는 차이가 없었습니다(실제로 왼쪽으로 치우쳐 보이던 문제) —
         Tooltip과 안쪽 span 모두 사이드바 전체 폭을 쓰는 블록으로 바꿔서,
         "기억의"/"조율" 두 줄이 사이드바 폭 기준으로 확실히 가운데 정렬되게
         합니다. */}
      <Tooltip label="데이터관리" align="start" focusable className="block w-full">
        <span className="block w-full text-center text-xs font-medium break-keep text-[var(--text-sub)] sm:text-sm sm:whitespace-nowrap">
          기억의 조율
        </span>
      </Tooltip>
    </aside>
  );
}

import Tooltip from "@/components/Tooltip";

/** 데이터 관리 모달 좌측 사이드바. 지금은 "기억의 조율" 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. 본문(탭+패널) 영역과 구분되도록 사이드바
 * 전체를 하나의 박스로 감쌉니다. */
export default function DataSidebar() {
  // my-2: 옆 탭 영역과 같은 높이로 꽉 늘어나(stretch) 위/아래 경계선에 바로 붙어
  // 있던 것을, 상하로 살짝 여백을 둬 세로 크기를 조금 줄입니다.
  return (
    <aside className="my-2 flex w-24 shrink-0 flex-col items-center rounded-2xl border border-black/[.06] bg-black/[.03] p-3 dark:border-white/[.08] dark:bg-white/[.04] sm:w-28">
      {/* 사이드바가 모달 왼쪽 가장자리에 붙어 있어, align="start"로 말풍선이
         오른쪽(본문 쪽 여유 공간)으로 펼치게 해 모달 밖으로 벗어나지 않게 합니다. */}
      <Tooltip label="데이터관리" align="start" focusable>
        <span className="text-center text-xs font-medium whitespace-nowrap text-black/80 sm:text-sm dark:text-zinc-200">
          기억의 조율
        </span>
      </Tooltip>
    </aside>
  );
}

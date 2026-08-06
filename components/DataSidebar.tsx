/** 데이터 관리 모달 좌측 사이드바. 지금은 "기억의 조율" 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. 본문(탭+패널) 영역과 구분되도록 사이드바
 * 전체를 하나의 박스로 감쌉니다. */
export default function DataSidebar() {
  return (
    <aside className="flex w-24 shrink-0 flex-col items-center rounded-2xl border border-black/[.06] bg-black/[.03] p-3 dark:border-white/[.08] dark:bg-white/[.04] sm:w-28">
      <span className="text-center text-xs font-medium whitespace-nowrap text-black/80 sm:text-sm dark:text-zinc-200">
        기억의 조율
      </span>
    </aside>
  );
}

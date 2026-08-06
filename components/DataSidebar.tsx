/** 데이터 관리 모달 좌측 사이드바. 지금은 "기억의 조율" 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. */
export default function DataSidebar() {
  return (
    <aside className="flex w-20 shrink-0 flex-col gap-2 sm:w-24">
      <div className="rounded-2xl border border-black/[.06] bg-black/[.03] px-2 py-3 text-center text-xs font-medium text-black/80 sm:text-sm dark:border-white/[.08] dark:bg-white/[.04] dark:text-zinc-200">
        기억의
        <br />
        조율
      </div>
    </aside>
  );
}

/** 환경 설정 모달 좌측 사이드바. DataSidebar와 같은 레이아웃(재사용 요구사항)을
 * 쓰되, 라벨만 "기억의 편집"으로 다릅니다. 지금은 이 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. */
export default function SettingsSidebar() {
  return (
    <aside className="my-2 flex w-24 shrink-0 flex-col items-center rounded-2xl border border-black/[.06] bg-black/[.03] p-3 dark:border-white/[.08] dark:bg-white/[.04] sm:w-28">
      <span className="text-center text-xs font-medium whitespace-nowrap text-black/80 sm:text-sm dark:text-zinc-200">
        기억의 편집
      </span>
    </aside>
  );
}

/** 환경 설정 모달 좌측 사이드바. DataSidebar와 같은 레이아웃(재사용 요구사항)을
 * 쓰되, 라벨만 "기억의 편집"으로 다릅니다. 지금은 이 한 항목뿐이라 내비게이션은
 * 없고, 현재 위치를 알리는 라벨로만 둡니다. */
export default function SettingsSidebar() {
  return (
    <aside className="my-2 flex w-24 shrink-0 flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--hover)] p-3 sm:w-28">
      <span className="text-center text-xs font-medium whitespace-nowrap text-[var(--text-sub)] sm:text-sm">
        기억의 편집
      </span>
    </aside>
  );
}

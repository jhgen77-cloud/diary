import Link from "next/link";

/** 정보 모달 좌측 사이드바. 첫 줄엔 "버전 정보" 라벨(DataSidebar의 "기억의
 * 조율"과 같은 위치·역할), 둘째 줄엔 "도움말" 페이지로 이동하는 버튼을
 * 둡니다(요구사항). "버전 정보"는 아직 클릭 동작이 없는 순수 라벨이고,
 * "도움말"만 실제로 이동하는 버튼입니다.
 *
 * DataSidebar와 같은 폭(w-16 → sm:w-28)·여백을 그대로 재사용합니다 — 좁은
 * 화면에서 라벨이 옆 본문 쪽으로 삐져나오던 문제를 그때 이미 해결해뒀던
 * 스타일(block w-full text-center break-keep)이라 여기서도 안전합니다. */
export default function InfoSidebar() {
  return (
    <aside className="my-2 flex w-16 shrink-0 flex-col items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--hover)] p-2 sm:w-28 sm:p-3">
      <span className="block w-full text-center text-xs font-medium break-keep text-[var(--text-sub)] sm:text-sm">
        버전 정보
      </span>
      <Link
        href="/info/help"
        className="block w-full rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1.5 text-center text-xs font-medium break-keep text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] sm:text-sm"
      >
        도움말
      </Link>
    </aside>
  );
}

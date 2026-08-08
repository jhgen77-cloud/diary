/** Supabase 글 목록을 불러오는 동안(Suspense fallback) 모달 안쪽에 보여줄 표시.
 * DiaryBrowserData/DiaryCalendarBrowserData 양쪽이 공유합니다(DiaryBrowser.tsx,
 * DiaryCalendarBrowser.tsx 참고 — 모달 뼈대는 그대로 즉시 뜨고 이 부분만 잠깐
 * 대신 보입니다). */
export default function DiaryLoadingIndicator() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-[var(--text-sub)] sm:text-base">불러오는 중...</p>
    </div>
  );
}

/** 도움말 페이지 본문. 실제 사용법 내용은 아직 작성하지 않습니다(요구사항) —
 * InfoContent와 같은 패턴으로 준비 중임을 알리는 안내 문구만 둡니다. 나중에
 * 내용을 채울 때는 이 컴포넌트만 고치면 됩니다(app/info/help/page.tsx와
 * app/@modal/(.)info/help/page.tsx가 함께 씀). */
export default function HelpContent() {
  return (
    <p className="text-sm text-[var(--text-sub)] sm:text-base">
      도움말 내용은 아직 준비 중입니다.
    </p>
  );
}

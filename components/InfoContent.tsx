/** 정보 및 도움말 모달의 본문. 프로그램 소개/사용법 등 실제 내용은 아직
 * 구현되지 않아(요구사항), 준비 중임을 알리는 안내 문구만 둡니다 —
 * app/@modal/(.)info/page.tsx와 app/info/page.tsx가 이 컴포넌트를
 * 공유해서 쓰므로, 나중에 내용을 채울 때도 한 곳만 고치면 됩니다. */
export default function InfoContent() {
  return (
    <p className="text-sm text-[var(--text-sub)] sm:text-base">
      프로그램 정보 및 도움말은 아직 준비 중입니다.
    </p>
  );
}

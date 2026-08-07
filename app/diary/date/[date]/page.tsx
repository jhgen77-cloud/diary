import Modal from "@/components/Modal";

// app/@modal/(.)diary/date/[date]/page.tsx와 내용이 같습니다(이 날짜별 보기
// 기능 자체는 아직 미구현이라 두 경로 모두 안내 문구만 표시합니다). 직접
// 접속/새로고침 시엔 인터셉트 라우트가 적용되지 않으므로 같은 내용을
// 미러링해, 최소한 빈 "준비 중" 페이지 대신 같은 모달 형태로 보이게 합니다.
export default async function DiaryDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return (
    <Modal title={date} closeHref="/">
      <p className="text-lg text-[var(--text)]">아직 준비 중입니다.</p>
    </Modal>
  );
}

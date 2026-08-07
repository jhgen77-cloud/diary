import Modal from "@/components/Modal";

export default async function DiaryDateModal({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return (
    <Modal title={date} closeHref="/">
      <p className="text-lg text-black dark:text-zinc-50">
        아직 준비 중입니다.
      </p>
    </Modal>
  );
}

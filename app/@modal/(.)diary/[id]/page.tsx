import Modal from "@/components/Modal";
import { getDiaryEntryById } from "@/lib/mockDiaryEntries";

export default async function DiaryEntryModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getDiaryEntryById(id);

  return (
    <Modal title={entry?.title ?? "그날의 기록"}>
      <p className="text-lg text-black dark:text-zinc-50">
        아직 준비 중입니다.
      </p>
    </Modal>
  );
}

import Modal from "@/components/Modal";
import DiaryBrowser from "@/components/DiaryBrowser";
import { mockDiaryEntries } from "@/lib/mockDiaryEntries";

export default async function DiaryModal({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <Modal title="그날을 거닐다" size="xl" closeHref="/">
      <DiaryBrowser entries={mockDiaryEntries} initialQuery={q} />
    </Modal>
  );
}

import { getDiaryEntryById } from "@/lib/mockDiaryEntries";

export default async function DiaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entry = getDiaryEntryById(id);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 p-8 text-center dark:bg-black">
      <p className="text-2xl text-black dark:text-zinc-50">
        {entry?.title ?? "그날의 기록"} — 아직 준비 중입니다.
      </p>
    </main>
  );
}

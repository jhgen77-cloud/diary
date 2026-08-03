export default async function DiaryDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-zinc-50 p-8 text-center dark:bg-black">
      <p className="text-2xl text-black dark:text-zinc-50">
        {date} — 아직 준비 중입니다.
      </p>
    </main>
  );
}

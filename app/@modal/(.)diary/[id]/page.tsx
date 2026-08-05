import DiaryEntryDetail from "@/components/DiaryEntryDetail";

export default async function DiaryEntryModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DiaryEntryDetail id={id} />;
}

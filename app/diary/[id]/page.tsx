import DiaryEntryDetail from "@/components/DiaryEntryDetail";

// app/@modal/(.)diary/[id]/page.tsx와 내용이 같습니다. DiaryEntryDetail이
// 자체적으로 <Modal>을 감싸고 있어 그대로 재사용합니다. 직접 접속/새로고침
// 시엔 인터셉트 라우트가 적용되지 않으므로 같은 내용을 미러링해 둡니다.
export default async function DiaryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <DiaryEntryDetail id={id} />;
}

import type { Metadata } from "next";
import DiaryEntryDetail from "@/components/DiaryEntryDetail";
import { buildPageMetadata } from "@/lib/pageMetadata";

// 실제 글 제목은 로그인한 본인만 볼 수 있는 개인 데이터라, 링크 미리보기 등에
// 노출되지 않도록 제목/설명 모두 일반적인 문구로 둡니다(글 내용을 메타데이터로
// 새어나가게 하지 않기 위함).
export const metadata: Metadata = buildPageMetadata("일기 보기", "기록된 하루를 다시 펼쳐봅니다.");

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

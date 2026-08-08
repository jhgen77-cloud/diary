import DiaryBrowser from "@/components/DiaryBrowser";
import { fetchMemoryEntriesServer } from "@/lib/memoryEntries.server";

interface DiaryBrowserDataProps {
  initialQuery?: string;
}

/** "그날을 거닐다" 목록의 Supabase 조회 부분만 따로 뗀 서버 컴포넌트입니다.
 * 예전엔 이 fetch를 Modal과 함께 그대로 await해서, Supabase 응답이 느릴 때
 * (가끔 발생) 클릭한 뒤 모달 자체가 늦게 뜨는 것처럼 보이는 문제가 있었습니다
 * (실제로 겪은 문제). 이 컴포넌트만 <Suspense>로 감싸면 Modal 뼈대(제목/닫기
 * 버튼)는 클릭 즉시 뜨고, 목록은 응답이 오는 대로 스트리밍으로 이어서
 * 채워집니다 — 클라이언트에서 마운트 후 다시 fetch하는 방식이 아니라 여전히
 * 서버에서 한 번에 내려주는 것이라, 새로고침 직후 목록이 비었다가 채워지는
 * 깜빡임(client fetch 방식의 옛 문제)도 다시 생기지 않습니다. */
export default async function DiaryBrowserData({ initialQuery }: DiaryBrowserDataProps) {
  const entries = await fetchMemoryEntriesServer();
  return <DiaryBrowser entries={entries} initialQuery={initialQuery} />;
}

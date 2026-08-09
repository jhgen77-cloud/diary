import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { rowToEntry } from "@/lib/memoryEntriesShared";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";

/** "그날을 거닐다"/달력 페이지(Server Component)가 렌더링되기 전에 미리
 * Supabase에서 글 목록을 가져옵니다. 클라이언트에서 마운트 후 다시 fetch하는
 * 대신 이 값을 그대로 초기 데이터로 내려주면, 새로고침 직후 목록이 잠깐
 * 비었다가 채워지는 깜빡임 자체가 생기지 않습니다(실제로 겪은 문제 — 클라이언트
 * fetch 방식은 로딩 중 표시를 넣어도 그 표시 자체가 깜빡이는 것으로 보였음).
 *
 * 로그인한 사용자 본인의 글만 가져옵니다 — 이 페이지는 proxy가 로그인한
 * 사용자만 들어오게 이미 막아두지만, 그것만으로는 "누가 봐도 되는 글인지"까지
 * 구분하지 못합니다(로그인한 아무 사용자나 전체 글을 다 봤음). */
export async function fetchMemoryEntriesServer(): Promise<DiaryEntry[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("memory_entries")
    // title_iv까지 함께 내려줍니다 — 암호화된 글이면 title이 암호문이라,
    // 클라이언트가 마운트된 뒤 unlock된 키가 있으면 이 값으로 복호화합니다
    // (이 파일은 서버에서만 실행되어 그 키에 접근할 수 없으므로 여기선
    // 복호화하지 않고 그대로 내려보내기만 합니다 — components/DiaryBrowser.tsx,
    // DiaryCalendarBrowser.tsx의 useDecryptedEntries 참고).
    .select(
      "id, title, has_attachment, created_at, entry_date, mood_key, weather_key, encrypted, title_iv"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("memory_entries 서버 조회 실패", error);
    return [];
  }
  return (data ?? []).map(rowToEntry);
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/** 카카오 등 OAuth 로그인이 끝나면 여기로 "?code=..."를 붙여 돌아옵니다
 * (@supabase/ssr의 PKCE 플로우). 그 code를 실제 로그인 세션(쿠키)으로
 * 교환해야 서버가 로그인 상태를 인식합니다 — Server Component 렌더링
 * 중에는 쿠키를 쓸 수 없어서, 쿠키를 쓸 수 있는 Route Handler에서
 * 이 교환을 처리한 뒤 원래 목적지로 리다이렉트합니다. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // code가 없거나 교환에 실패하면 로그인 화면으로 돌려보냅니다.
  return NextResponse.redirect(`${origin}/login`);
}

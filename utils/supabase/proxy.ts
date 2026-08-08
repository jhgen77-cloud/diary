import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 로그인한 사용자만 들어갈 수 있는 경로. 메인 인덱스 페이지("/")도 이제
// 포함됩니다 — 로그인/회원가입/비밀번호 관련 페이지와 개인정보 처리방침,
// OAuth 콜백만 예외로 둡니다(그렇지 않으면 로그인 페이지 자체가 막혀 무한
// 리다이렉트에 빠집니다). 모달로 열릴 때도 URL 경로 자체는 동일해서(@modal의
// (.)diary 등은 렌더링 트리만 다를 뿐 pathname은 같음) 이 검사 하나로 모달
// 진입도 함께 막힙니다.
const PROTECTED_PREFIXES = ["/diary", "/data", "/settings", "/info"];
// 위 배열 방식(prefix + "/")으로는 루트 "/"를 넣을 수 없습니다 — 모든 경로가
// "/"로 시작해서 로그인 페이지까지 막아버립니다. 정확히 "/"인 경우만 별도로
// 확인합니다.
function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export const updateSession = async (request: NextRequest) => {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // IMPORTANT: createServerClient와 getUser() 사이에는 로직을 넣지 않습니다 —
  // 실수로 뭔가를 끼워 넣으면 세션 갱신 타이밍이 어긋나 사용자가 갑자기
  // 로그아웃된 것처럼 보이는 버그로 이어질 수 있습니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse
};

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 로그인한 사용자만 들어갈 수 있는 경로 — 메인 인덱스 페이지("그날을 거닐다"/
// "시간을 붙잡다"/"기억의 유실을 회복하다"로 가는 진입점)는 그대로 누구나 볼 수
// 있고, 실제 그 세 기능의 경로(및 하위 경로 — 글 상세, 달력, 글쓰기 등)와
// /settings, /info만 막습니다. 모달로 열릴 때도 URL 경로 자체는 동일해서
// (@modal의 (.)diary 등은 렌더링 트리만 다를 뿐 pathname은 같음) 이 검사
// 하나로 모달 진입도 함께 막힙니다.
const PROTECTED_PREFIXES = ["/diary", "/data", "/settings", "/info"];

function isProtectedPath(pathname: string): boolean {
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

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/pageMetadata";

// app/login/page.tsx는 클라이언트 컴포넌트("use client")라 metadata를 직접
// export할 수 없어서, 같은 경로 세그먼트의 레이아웃(서버 컴포넌트)에 둡니다.
export const metadata: Metadata = buildPageMetadata(
  "로그인",
  "기억에 로그인하고 나만의 하루를 기록하세요."
);

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}

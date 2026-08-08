import type { Metadata } from "next";
import type { ReactNode } from "react";
import { buildPageMetadata } from "@/lib/pageMetadata";

// app/reset-password/page.tsx는 클라이언트 컴포넌트라 metadata를 직접
// export할 수 없어서, 같은 경로 세그먼트의 레이아웃(서버 컴포넌트)에 둡니다.
export const metadata: Metadata = buildPageMetadata(
  "비밀번호 재설정",
  "새 비밀번호를 설정하세요."
);

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}

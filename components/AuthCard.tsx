import type { ReactNode } from "react";
import Header from "@/components/Header";

interface AuthCardProps {
  /** 이메일/비밀번호 인풋 등 폼 영역 */
  children: ReactNode;
  /** 버튼 아래에 배치되는 다른 페이지로의 링크 영역 */
  footer: ReactNode;
}

/** 로그인/회원가입 페이지가 공유하는 카드 레이아웃 — 로고, 폼, 하단 링크 순으로 배치합니다. */
export default function AuthCard({ children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="flex h-fit w-full max-w-md flex-col items-center self-center rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <Header />
        <div className="my-4 h-px w-full max-w-xs shrink-0 bg-[var(--border)] sm:my-6" />
        <div className="flex w-full flex-col gap-4">{children}</div>
        <p className="mt-6 text-sm text-[var(--text-sub)]">{footer}</p>
      </div>
    </div>
  );
}

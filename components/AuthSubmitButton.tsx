import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  children: ReactNode;
}

/** 로그인/회원가입 폼의 제출 버튼 — 기능은 아직 연결하지 않습니다(요구사항). */
export default function AuthSubmitButton({ children }: AuthSubmitButtonProps) {
  return (
    <button
      type="button"
      className="mt-2 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
    >
      {children}
    </button>
  );
}

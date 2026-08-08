import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  children: ReactNode;
  /** 기본값 "button". 폼 제출과 연결하려면 "submit"으로 지정합니다. */
  type?: "button" | "submit";
  disabled?: boolean;
}

/** 로그인/회원가입 폼의 제출 버튼. */
export default function AuthSubmitButton({
  children,
  type = "button",
  disabled = false,
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="mt-2 w-full rounded-xl bg-[var(--accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--accent)]"
    >
      {children}
    </button>
  );
}

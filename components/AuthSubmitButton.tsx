import type { ReactNode } from "react";

interface AuthSubmitButtonProps {
  children: ReactNode;
  /** 기본값 "button". 폼 제출과 연결하려면 "submit"으로 지정합니다. */
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  /** "primary"(기본) — 꽉 찬 액센트 배경의 주 동작 버튼(로그인/회원가입).
   * "secondary" — 테두리만 있는 보조 동작 버튼.
   * "kakao" — 카카오 로그인 전용, 파스텔 톤의 옅은 노란색. */
  variant?: "primary" | "secondary" | "kakao";
}

const VARIANT_CLASS: Record<NonNullable<AuthSubmitButtonProps["variant"]>, string> = {
  primary:
    "mt-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:hover:bg-[var(--accent)]",
  secondary:
    "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] disabled:hover:bg-transparent",
  // 카카오 브랜드 노란색(#FEE500)을 그대로 쓰기엔 채도가 높아 앱의 파스텔 톤과
  // 안 어울려서, 같은 색상감을 옅게 눌러 파스텔 노랑으로 구현했습니다.
  kakao:
    "border border-amber-200 bg-amber-100 text-amber-900 hover:bg-amber-200 disabled:hover:bg-amber-100",
};

/** 로그인/회원가입 폼의 제출 버튼. */
export default function AuthSubmitButton({
  children,
  type = "button",
  disabled = false,
  onClick,
  variant = "primary",
}: AuthSubmitButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-xl py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]}`}
    >
      {children}
    </button>
  );
}

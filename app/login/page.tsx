import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";

export default function LoginPage() {
  return (
    <AuthCard
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-[var(--accent)] hover:underline"
          >
            회원가입
          </Link>
        </>
      }
    >
      <AuthField
        id="email"
        label="이메일"
        type="email"
        placeholder="이메일을 입력하세요"
        autoComplete="email"
      />
      <AuthField
        id="password"
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        autoComplete="current-password"
      />
      <AuthSubmitButton>로그인</AuthSubmitButton>
    </AuthCard>
  );
}

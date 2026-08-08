import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";

export default function SignupPage() {
  return (
    <AuthCard
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            로그인
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
        autoComplete="new-password"
      />
      <AuthField
        id="password-confirm"
        label="비밀번호 확인"
        type="password"
        placeholder="비밀번호를 다시 입력하세요"
        autoComplete="new-password"
      />
      <AuthSubmitButton>회원가입</AuthSubmitButton>
    </AuthCard>
  );
}

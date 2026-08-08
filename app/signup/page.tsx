"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import Toast from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { getSignupErrorMessage } from "@/lib/authErrorMessage";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = email !== "" && password !== "" && passwordConfirm !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (error) {
      setErrorMessage(getSignupErrorMessage(error));
      return;
    }
    // 이미 가입된 이메일이면 Supabase가 오류 대신 identities가 빈 배열인
    // 가짜 성공 응답을 돌려줍니다 — 이 경우도 실패로 취급합니다.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setErrorMessage("이미 가입된 이메일입니다.");
      return;
    }

    router.push("/");
  }

  return (
    <>
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
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <AuthField
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일을 입력하세요"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            required
          />
          <AuthField
            id="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            required
          />
          <AuthField
            id="password-confirm"
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={setPasswordConfirm}
            required
          />
          <AuthSubmitButton type="submit" disabled={!canSubmit || submitting}>
            회원가입
          </AuthSubmitButton>
        </form>
      </AuthCard>
      {errorMessage && (
        <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}
    </>
  );
}

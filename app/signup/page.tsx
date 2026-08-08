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
    // 프로젝트에 "이메일 확인"이 켜져 있으면 가입 직후엔 세션(로그인 쿠키)이
    // 없습니다 — 이 상태에서 메인 페이지로 보내면 로그인된 것처럼 보이지만
    // 실제로는 인증이 안 된 상태라, 보호된 페이지(예: 설정)에 들어가려는 순간
    // 다시 로그인 화면으로 튕겨나가 "로그인이 초기화된" 것처럼 보입니다. 세션이
    // 없으면 메인으로 보내지 않고 이메일 확인을 안내합니다.
    if (!data.session) {
      setErrorMessage(
        "가입 확인 이메일을 보냈습니다. 메일함에서 링크를 눌러 인증을 완료한 뒤 로그인해주세요."
      );
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

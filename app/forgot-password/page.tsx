"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import Toast from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { getResetPasswordErrorMessage } from "@/lib/authErrorMessage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = email !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);

    if (error) {
      setErrorMessage(getResetPasswordErrorMessage(error));
      return;
    }

    // Supabase는 계정 존재 여부를 숨기려고 가입 안 된 이메일에도 보통 성공을
    // 돌려줍니다 — 그래서 "보냈다"는 안내만 하고, 실제로 이메일이 왔는지는
    // 사용자가 메일함에서 확인해야 합니다.
    setSent(true);
  }

  return (
    <>
      <AuthCard
        footer={
          <p>
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        }
      >
        {sent ? (
          <p className="text-sm whitespace-pre-line text-[var(--text)]">
            {`입력하신 이메일로 비밀번호 재설정 링크를 보냈습니다.\n메일함(스팸함 포함)에서 확인해주세요.`}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <AuthField
              id="email"
              label="이메일"
              type="email"
              placeholder="가입하신 이메일을 입력하세요"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              required
            />
            <AuthSubmitButton type="submit" disabled={!canSubmit || submitting}>
              재설정 링크 보내기
            </AuthSubmitButton>
          </form>
        )}
      </AuthCard>
      {errorMessage && (
        <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import Toast from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { getLoginErrorMessage } from "@/lib/authErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = email !== "" && password !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (error) {
      setErrorMessage(getLoginErrorMessage(error));
      return;
    }

    router.push("/");
  }

  return (
    <>
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
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
          <AuthSubmitButton type="submit" disabled={!canSubmit || submitting}>
            로그인
          </AuthSubmitButton>
        </form>
      </AuthCard>
      {errorMessage && (
        <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}
    </>
  );
}

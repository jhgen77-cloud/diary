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
            <p>
              <Link
                href="/forgot-password"
                className="text-[var(--accent)] hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </p>
            <p>
              계정이 없으신가요?{" "}
              <Link
                href="/signup"
                className="text-[var(--accent)] hover:underline"
              >
                회원가입
              </Link>
            </p>
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
          {/* 회원가입 페이지는 인풋(라벨+필드)이 3개, 로그인은 2개(+버튼 2개)라
              내용물 높이가 자연히 달라 박스 세로 크기가 서로 달랐습니다 — 인풋
              한 칸(라벨줄 높이)만큼 빈 공간을 더해 박스 크기를 맞춥니다. */}
          <div className="h-[36px]" aria-hidden />
          <AuthSubmitButton type="submit" disabled={!canSubmit || submitting}>
            로그인
          </AuthSubmitButton>
          {/* 카카오 OAuth는 Supabase 프로젝트에 직접 설정할 예정이라, 지금은
              기능 연결 없이 버튼만 둡니다(눌러도 아무 동작 안 함). */}
          <AuthSubmitButton type="button" variant="kakao">
            카카오 로그인
          </AuthSubmitButton>
        </form>
      </AuthCard>
      {errorMessage && (
        <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}
    </>
  );
}

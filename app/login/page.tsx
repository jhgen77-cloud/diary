"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import Toast from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { getLoginErrorMessage, getOAuthErrorMessage } from "@/lib/authErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [kakaoSubmitting, setKakaoSubmitting] = useState(false);
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

  async function handleKakaoLogin() {
    if (kakaoSubmitting) return;
    setKakaoSubmitting(true);
    const supabase = createClient();
    // 성공하면 카카오 로그인 화면으로 리다이렉트되어 이 페이지를 벗어나므로,
    // 여기서 실패(설정 누락 등)한 경우에만 에러를 보여주면 됩니다.
    // redirectTo는 메인 페이지가 아니라 /auth/callback으로 보내 code를
    // 세션으로 교환한 뒤 메인 페이지로 다시 리다이렉트되게 합니다.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (error) {
      setKakaoSubmitting(false);
      setErrorMessage(getOAuthErrorMessage(error));
    }
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
          <AuthSubmitButton
            type="button"
            variant="kakao"
            onClick={handleKakaoLogin}
            disabled={kakaoSubmitting}
          >
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

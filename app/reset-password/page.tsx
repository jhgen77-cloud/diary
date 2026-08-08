"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import Toast from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";
import { getUpdatePasswordErrorMessage } from "@/lib/authErrorMessage";

type ExchangeState = "checking" | "ready" | "failed";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 이메일의 재설정 링크는 프로젝트 설정에 따라 두 가지 형태로 돌아올 수
  // 있습니다:
  // 1) "?code=..." (PKCE) — exchangeCodeForSession으로 직접 세션과 교환.
  // 2) "#access_token=...&type=recovery" (기존 방식) — 쿼리가 아니라 URL
  //    해시라 여기서 직접 못 읽지만, Supabase 클라이언트가 페이지 로드 시
  //    자동으로 감지해서 세션을 만들고 PASSWORD_RECOVERY 이벤트를 쏴줍니다.
  // 어느 쪽이 오는지 미리 알 수 없어 둘 다 대기하다가, 먼저 끝나는 쪽을
  // 따릅니다.
  const code = searchParams.get("code");
  const [exchangeState, setExchangeState] = useState<ExchangeState>("checking");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !settled) {
        settled = true;
        setExchangeState("ready");
      }
    });

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (settled) return;
        settled = true;
        setExchangeState(error ? "failed" : "ready");
      });
    } else {
      // 해시 기반 자동 감지는 비동기라 약간의 지연이 있을 수 있습니다 —
      // 그 시간 안에 PASSWORD_RECOVERY 이벤트가 안 오면 그때 실패로 판단합니다.
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          setExchangeState("failed");
        }
      }, 3000);
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, [code]);

  const canSubmit = password !== "" && passwordConfirm !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || submitting) return;

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      setErrorMessage(getUpdatePasswordErrorMessage(error));
      return;
    }

    // code 교환 때 이미 로그인 세션이 만들어져 있으므로, 새 비밀번호 저장 후
    // 다시 로그인시키지 않고 바로 메인 페이지로 보냅니다.
    router.push("/");
  }

  return (
    <>
      <AuthCard
        footer={
          exchangeState === "failed" ? (
            <p>
              <Link href="/forgot-password" className="text-[var(--accent)] hover:underline">
                비밀번호 재설정 다시 요청하기
              </Link>
            </p>
          ) : undefined
        }
      >
        {exchangeState === "checking" && (
          <p className="text-sm text-[var(--text-sub)]">링크를 확인하는 중입니다...</p>
        )}
        {exchangeState === "failed" && (
          <p className="text-sm whitespace-pre-line text-[var(--text)]">
            {`링크가 만료되었거나 이미 사용된 링크입니다.\n비밀번호 재설정을 다시 요청해주세요.`}
          </p>
        )}
        {exchangeState === "ready" && (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <AuthField
              id="password"
              label="새 비밀번호"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
              required
            />
            <AuthField
              id="password-confirm"
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              required
            />
            <AuthSubmitButton type="submit" disabled={!canSubmit || submitting}>
              비밀번호 변경
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

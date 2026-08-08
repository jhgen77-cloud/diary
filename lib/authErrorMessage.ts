import type { AuthError } from "@supabase/supabase-js";

/** Supabase 회원가입 오류를 화면에 보여줄 한국어 메시지로 변환합니다. */
export function getSignupErrorMessage(error: AuthError): string {
  const message = error.message ?? "";

  if (/already registered|already exists|user already/i.test(message)) {
    return "이미 가입된 이메일입니다.";
  }
  if (/password/i.test(message) && /(least|short|characters|length)/i.test(message)) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (/invalid.*email|unable to validate email/i.test(message)) {
    return "올바른 이메일 형식이 아닙니다.";
  }
  if (/rate limit/i.test(message)) {
    return "잠시 후 다시 시도해주세요.";
  }
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

/** Supabase 로그인 오류를 화면에 보여줄 한국어 메시지로 변환합니다. */
export function getLoginErrorMessage(error: AuthError): string {
  const message = error.message ?? "";

  if (/invalid login credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (/email not confirmed/i.test(message)) {
    return "이메일 인증을 완료해주세요.";
  }
  if (/rate limit/i.test(message)) {
    return "잠시 후 다시 시도해주세요.";
  }
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

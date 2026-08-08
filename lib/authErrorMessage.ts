import type { AuthError } from "@supabase/supabase-js";

// error.code(https://supabase.com/docs/guides/auth/debugging/error-codes)는
// Supabase가 보장하는 안정적인 값입니다 — message 문자열은 버전에 따라
// 바뀌거나, 보안상 일부러 뭉뚱그려지기도 합니다(예: 계정 존재 여부를 숨기려고
// "비밀번호 틀림"과 "이메일 미인증"을 똑같이 뭉뚱그린 문구로 돌려주는 경우가
// 있음). 그래서 code를 우선 보고, code가 없는 경우(네트워크 오류 등)에만
// message를 보조로 봅니다.

/** Supabase 회원가입 오류를 화면에 보여줄 한국어 메시지로 변환합니다. */
export function getSignupErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "이미 가입된 이메일입니다.";
    case "weak_password":
      return "비밀번호가 너무 약합니다. 6자 이상으로 입력해주세요.";
    case "email_address_invalid":
    case "validation_failed":
      return "올바른 이메일 형식이 아닙니다.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "잠시 후 다시 시도해주세요.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "현재 이메일 회원가입이 비활성화되어 있습니다.";
  }

  const message = error.message ?? "";
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

/** Supabase 로그인 오류를 화면에 보여줄 한국어 메시지로 변환합니다. */
export function getLoginErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    case "email_not_confirmed":
      return "이메일 인증이 완료되지 않았습니다. 가입할 때 받은 확인 메일의 링크를 눌러주세요.";
    case "over_request_rate_limit":
      return "잠시 후 다시 시도해주세요.";
    case "user_banned":
      return "이용이 제한된 계정입니다.";
  }

  const message = error.message ?? "";
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

/** Supabase 비밀번호 재설정 메일 발송 오류를 화면에 보여줄 한국어 메시지로
 * 변환합니다. resetPasswordForEmail은 계정 존재 여부를 숨기려고 가입 안 된
 * 이메일에도 보통 성공을 돌려주므로(사용자 열거 공격 방지), 여기서 다루는
 * 오류는 대부분 형식/속도 제한 관련입니다. */
export function getResetPasswordErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "email_address_invalid":
    case "validation_failed":
      return "올바른 이메일 형식이 아닙니다.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "잠시 후 다시 시도해주세요.";
  }

  const message = error.message ?? "";
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

/** 비밀번호 재설정 링크로 들어온 뒤 새 비밀번호로 바꾸는(updateUser) 단계의
 * 오류를 화면에 보여줄 한국어 메시지로 변환합니다. */
export function getUpdatePasswordErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "weak_password":
      return "비밀번호가 너무 약합니다. 6자 이상으로 입력해주세요.";
    case "same_password":
      return "이전과 동일한 비밀번호로는 변경할 수 없습니다.";
    case "session_expired":
    case "session_not_found":
    case "bad_jwt":
      return "인증이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.";
  }

  const message = error.message ?? "";
  if (/network/i.test(message)) {
    return "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";
  }

  return "비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.";
}

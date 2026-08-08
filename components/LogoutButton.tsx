"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/** 메인 인덱스 페이지 우측 하단의 로그아웃 버튼 — 로그인한 사용자에게만 보입니다
 * (app/page.tsx가 서버에서 로그인 여부를 확인해 렌더링 여부를 결정합니다). */
export default function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // 같은 페이지에 그대로 두고 새로고침만 하면 버튼만 조용히 사라져서
    // 로그아웃이 실제로 됐는지 알아채기 어려웠습니다 — 로그인 페이지로
    // 이동시켜 로그아웃됐다는 걸 명확하게 보여줍니다.
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="rounded-full border border-[var(--border)] px-4 py-1.5 text-xs text-[var(--text-sub)] transition-colors hover:bg-[var(--hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    >
      로그아웃
    </button>
  );
}

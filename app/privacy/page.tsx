import Link from "next/link";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = buildPageMetadata(
  "개인정보 처리방침",
  "기억이 어떤 개인정보를 어떻게 다루는지 안내합니다."
);

interface Section {
  heading: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    heading: "1. 수집하는 개인정보 항목",
    body: `이메일/비밀번호로 회원가입 시: 이메일 주소, 비밀번호(암호화되어 저장되며 서비스 운영자를 포함해 누구도 원문을 볼 수 없습니다).
카카오 로그인 시: 카카오가 제공하는 계정 식별 정보(카카오 계정과 연결된 고유 식별자 등, 카카오 개발자 설정에 따라 이메일이 포함될 수 있습니다).
서비스 이용 중: 작성하신 일기의 제목, 본문, 기분·날씨 선택값, 첨부 이미지, 작성/수정 일시.`,
  },
  {
    heading: "2. 개인정보의 수집 및 이용 목적",
    body: `회원 식별 및 로그인 상태 유지, 작성하신 일기를 본인 계정에만 연결해 다른 사용자와 구분하기 위한 목적으로만 이용합니다. 그 외의 목적(광고, 마케팅 등)으로는 이용하지 않습니다.`,
  },
  {
    heading: "3. 개인정보의 보유 및 이용 기간",
    body: `회원 탈퇴 또는 "기억의 유실을 회복하다" 메뉴의 "기억의 소멸" 기능으로 데이터를 직접 삭제하실 때까지 보유합니다. 삭제를 요청하시면 지체 없이 파기합니다.`,
  },
  {
    heading: "4. 개인정보의 제3자 제공 및 처리위탁",
    body: `수집한 개인정보를 외부에 판매하거나 제공하지 않습니다. 다만 서비스 운영을 위해 아래 업체에 데이터 처리를 위탁하고 있습니다.

Supabase (데이터베이스·인증·파일 저장소 운영)
카카오 (카카오 로그인을 선택하신 경우, 로그인 인증 처리)`,
  },
  {
    heading: "5. 이용자의 권리",
    body: `언제든지 본인의 일기 데이터를 조회·수정·삭제할 수 있습니다. 데이터베이스는 Row Level Security로 보호되어 본인만 자신의 데이터에 접근할 수 있습니다. 계정 삭제나 전체 데이터 삭제를 원하시면 문의처로 연락해주세요.`,
  },
  {
    heading: "6. 쿠키의 사용",
    body: `로그인 상태를 유지하기 위한 목적으로만 쿠키를 사용합니다. 이 쿠키에는 광고·추적 목적의 정보가 포함되지 않습니다.`,
  },
  {
    heading: "7. 문의처",
    body: `개인정보 처리에 관해 궁금하신 점은 아래 이메일로 문의해주세요.

jhgen77@gmail.com`,
  },
];

const LAST_UPDATED = "2026-08-09";

/** 인증 여부와 무관하게 누구나 접근 가능한 정적 안내 페이지입니다 — proxy.ts의
 * PROTECTED_PREFIXES에 이 경로를 넣지 않아야 합니다. */
export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-2xl py-10 sm:py-14">
        <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">
          개인정보 처리방침
        </h1>
        <p className="mt-2 text-sm text-[var(--text-sub)]">최종 수정일: {LAST_UPDATED}</p>
        <p className="mt-6 text-sm leading-relaxed whitespace-pre-line text-[var(--text)] sm:text-base">
          {`"기억"(이하 "서비스")은 이용자의 개인정보를 소중히 다루며, 아래와 같이 개인정보를 수집·이용·보관합니다.`}
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-semibold text-[var(--text)] sm:text-lg">
                {section.heading}
              </h2>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-[var(--text-sub)] sm:text-base">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <Link
          href="/"
          className="mt-10 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          ← 메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

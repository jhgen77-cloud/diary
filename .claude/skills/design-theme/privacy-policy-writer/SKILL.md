---
name: privacy-policy-writer
description: |
  한국 개인정보보호법(제30조)에 부합하는 개인정보 처리방침을 Next.js App Router 페이지 컴포넌트(app/privacy/page.tsx)로 자동 생성하는 스킬. 바이브코더/소상공인이 단 3개 질문(서비스명·운영자명·연락처 이메일)만 답하면 나머지는 고정된 기본 스택(Supabase 한국 리전 + Vercel 한국 리전, 결제·AI·분석 없음)으로 완성된 TSX 페이지를 생성한다. 개인정보보호위원회 「개인정보 처리방침 작성지침(2025.4.)」 기준.
  - 트리거: 개인정보 처리방침, 처리방침, 프라이버시 정책, privacy policy, 개인정보처리방침 작성, 개인정보 보호방침, 개인정보 방침
  - 용도: Next.js 기반 소규모 서비스(Supabase + Vercel 한국 리전 스택)에서 별도 페이지로 배치할 개인정보 처리방침 자동 작성
  - 결과물: app/privacy/page.tsx (TypeScript + Tailwind CSS, metadata export, 시행일 자동 계산)
---

# 개인정보 처리방침 작성 스킬 (Next.js · Supabase 한국 리전용)

## 이 스킬의 목적

바이브코더가 자신이 만든 서비스에 법적으로 요구되는 **개인정보 처리방침**을 쉽게 작성할 수 있도록 돕는다. 개인정보보호법 제30조 위반 시 **1천만 원 이하의 과태료**가 부과되므로, 회원가입을 제공하는 모든 서비스는 반드시 수립·공개해야 한다.

---

## 핵심 규칙

사용자가 처리방침을 만들어달라고 요청하면 다음 순서로 진행한다.

1. **질문은 딱 3개만** — 서비스명 / 운영자명 / 연락처 이메일
2. 나머지는 **고정 가정**으로 자동 처리 (아래 참조)
3. **`app/privacy/page.tsx`** 파일을 TypeScript + Tailwind CSS로 생성
4. 적용 방법(푸터 링크, 동의 체크박스) 안내

---

## Step 1: 사용자에게 3가지만 질문

```
처리방침을 만들기 위해 3가지만 알려주세요.

1. 서비스명 (예: MemoApp, 커피주문앱)
2. 운영자/상호명 (개인이면 이름, 사업자면 상호 — 예: 이정환 / OO스튜디오)
3. 연락처 이메일 (개인정보 보호책임자로 표시됩니다)
```

---

## Step 2: 고정 가정 (사용자에게 물어보지 않음)

이 스킬은 아래 스택을 전제로 한다. 다른 스택이라고 사용자가 명시적으로 말하면 그때만 조정.

| 항목         | 고정값                                           | 비고                                          |
| ------------ | ------------------------------------------------ | --------------------------------------------- |
| 인증/DB      | **Supabase (한국 리전 — Seoul, ap-northeast-2)** | 위탁 섹션에만 기재, **국외 이전 섹션 불필요** |
| 호스팅       | **Vercel (한국 Edge)**                           | 위탁 섹션에만 기재                            |
| AI API       | **사용 안 함**                                   | 해당 위탁 항목 생성 안 함                     |
| 결제         | **사용 안 함**                                   | 제3자 제공 섹션 생성 안 함                    |
| 분석/로깅    | **사용 안 함**                                   | 관련 항목 생성 안 함                          |
| 이메일 발송  | **사용 안 함**                                   | 관련 항목 생성 안 함                          |
| 만 14세 미만 | **아니오**                                       | 법정대리인 섹션 생성 안 함                    |
| 수집 항목    | 이메일, 비밀번호 (회원가입 기본)                 |                                               |
| 자동 수집    | IP, 쿠키, 접속 로그                              | 쿠키 섹션 포함                                |
| 시행일       | **페이지 렌더링 시점의 오늘 날짜** (하드코딩 X)  |                                               |
| 사이트 URL   | **런타임 `location.origin` 사용**                | 본문 내 URL 표시 시                           |

### 🔴 한국 리전 사용 = 국외 이전 섹션 **생성하지 않음**

Supabase와 Vercel 모두 한국 리전을 사용하므로 개인정보가 국내에서만 저장·처리된다. 따라서 "개인정보의 국외 이전" 섹션은 **만들지 않는다.** 다만 수탁자(Supabase Inc., Vercel Inc.)가 해외 법인이므로 **"처리 업무의 위탁" 섹션에는 기재**한다.

---

## Step 3: 파일 생성

**파일 경로**: `app/privacy/page.tsx`

아래 템플릿을 사용자 답변으로 채워서 그대로 생성한다. 치환 대상은 `{{서비스명}}`, `{{운영자명}}`, `{{연락처이메일}}` 3개뿐.

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: "{{서비스명}}의 개인정보 처리방침 안내 페이지입니다.",
  robots: { index: true, follow: true },
};

const SERVICE_NAME = "{{서비스명}}";
const OPERATOR_NAME = "{{운영자명}}";
const CONTACT_EMAIL = "{{연락처이메일}}";

const EFFECTIVE_DATE = new Date().toISOString().slice(0, 10);

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <header className="mb-10 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          개인정보 처리방침
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          시행일:{" "}
          <time dateTime={EFFECTIVE_DATE}>{EFFECTIVE_DATE}</time>
        </p>
      </header>

      <section className="mb-10 leading-relaxed">
        <p>
          {SERVICE_NAME}(이하 &quot;서비스&quot;)은 정보주체의 자유와
          권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한
          바를 준수하여, 적법하게 개인정보를 처리하고 안전하게
          관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라
          정보주체에게 개인정보의 처리와 보호에 관한 절차 및 기준을
          안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수
          있도록 하기 위하여 다음과 같이 개인정보 처리방침을
          수립·공개합니다.
        </p>
      </section>

      <nav
        aria-label="목차"
        className="mb-12 rounded-lg border bg-gray-50 p-5"
      >
        <h2 className="mb-3 text-base font-semibold">목차</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
          <li>
            <a href="#s1" className="hover:underline">
              개인정보의 처리 목적
            </a>
          </li>
          <li>
            <a href="#s2" className="hover:underline">
              처리하는 개인정보의 항목
            </a>
          </li>
          <li>
            <a href="#s3" className="hover:underline">
              개인정보의 처리 및 보유 기간
            </a>
          </li>
          <li>
            <a href="#s4" className="hover:underline">
              개인정보의 파기 절차 및 방법
            </a>
          </li>
          <li>
            <a href="#s5" className="hover:underline">
              개인정보 처리업무의 위탁
            </a>
          </li>
          <li>
            <a href="#s6" className="hover:underline">
              정보주체의 권리·의무 및 행사방법
            </a>
          </li>
          <li>
            <a href="#s7" className="hover:underline">
              개인정보의 안전성 확보 조치
            </a>
          </li>
          <li>
            <a href="#s8" className="hover:underline">
              쿠키 운영 및 거부 방법
            </a>
          </li>
          <li>
            <a href="#s9" className="hover:underline">
              개인정보 보호책임자
            </a>
          </li>
          <li>
            <a href="#s10" className="hover:underline">
              권익침해 구제방법
            </a>
          </li>
          <li>
            <a href="#s11" className="hover:underline">
              처리방침의 변경
            </a>
          </li>
        </ol>
      </nav>

      <section id="s1" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          1. 개인정보의 처리 목적
        </h2>
        <p className="mb-3 leading-relaxed">
          {SERVICE_NAME}은 다음의 목적을 위하여 개인정보를 처리합니다.
          처리하고 있는 개인정보는 다음의 목적 이외의 용도로는
          이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보
          보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를
          이행할 예정입니다.
        </p>
        <ol className="list-decimal space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>회원 가입 및 관리</strong>
            <br />
            회원 가입 의사 확인, 본인 식별·인증, 회원자격 유지·관리,
            서비스 부정이용 방지 목적으로 개인정보를 처리합니다.
          </li>
          <li>
            <strong>서비스 제공</strong>
            <br />
            {SERVICE_NAME}의 기능 제공 및 서비스 운영을 위하여
            개인정보를 처리합니다.
          </li>
          <li>
            <strong>고충 처리</strong>
            <br />
            정보주체의 문의사항 확인 및 사실조사를 위한 연락·통지,
            처리결과 통보 목적으로 개인정보를 처리합니다.
          </li>
        </ol>
      </section>

      <section id="s2" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          2. 처리하는 개인정보의 항목
        </h2>
        <div className="mb-4">
          <h3 className="mb-2 font-semibold">
            가. 회원가입 시 수집·이용 항목
          </h3>
          <ul className="list-disc space-y-1 pl-6 leading-relaxed">
            <li>
              <strong>법적 근거</strong>: 「개인정보 보호법」
              제15조제1항제4호(계약 체결·이행)
            </li>
            <li>
              <strong>필수 항목</strong>: 이메일 주소, 비밀번호(단방향
              암호화하여 저장, 원문 보관하지 않음)
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">
            나. 서비스 이용 과정에서 자동 수집되는 항목
          </h3>
          <p className="leading-relaxed">
            IP 주소, 쿠키, 서비스 이용 기록, 접속 로그, 브라우저 정보,
            기기 정보
          </p>
        </div>
      </section>

      <section id="s3" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          3. 개인정보의 처리 및 보유 기간
        </h2>
        <p className="mb-4 leading-relaxed">
          {SERVICE_NAME}은 법령에 따른 개인정보 보유·이용기간 또는
          정보주체로부터 개인정보를 수집 시에 동의받은 개인정보
          보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">
                  처리 목적
                </th>
                <th className="border px-3 py-2 text-left">
                  보유 기간
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">
                  회원 가입 및 관리
                </td>
                <td className="border px-3 py-2">회원 탈퇴 시까지</td>
              </tr>
              <tr>
                <td className="border px-3 py-2">서비스 제공</td>
                <td className="border px-3 py-2">
                  서비스 제공 완료 시까지
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          다만, 관계 법령 위반에 따른 수사·조사가 진행 중인 경우 또는
          관련 법령에 따른 보존 의무가 있는 경우에는 해당 기간 종료
          시까지 보유합니다.
        </p>
      </section>

      <section id="s4" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          4. 개인정보의 파기 절차 및 방법
        </h2>
        <p className="mb-3 leading-relaxed">
          {SERVICE_NAME}은 개인정보 보유기간의 경과, 처리목적 달성 등
          개인정보가 불필요하게 되었을 때에는 지체 없이 해당
          개인정보를 파기합니다.
        </p>
        <ul className="list-disc space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>파기 절차</strong>: 이용자의 회원 탈퇴 요청 또는
            보유기간 만료 시 즉시 파기
          </li>
          <li>
            <strong>파기 방법</strong>: 전자적 파일은 복구 및 재생이
            불가능한 방법으로 영구 삭제
          </li>
        </ul>
      </section>

      <section id="s5" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          5. 개인정보 처리업무의 위탁
        </h2>
        <p className="mb-4 leading-relaxed">
          {SERVICE_NAME}은 원활한 서비스 운영을 위해 다음과 같이
          개인정보 처리업무를 위탁하고 있습니다. 모든 위탁 업체는
          대한민국 리전(Seoul)에서 개인정보를 저장·처리하고 있습니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">
                  수탁업체
                </th>
                <th className="border px-3 py-2 text-left">
                  위탁 업무
                </th>
                <th className="border px-3 py-2 text-left">
                  처리 지역
                </th>
                <th className="border px-3 py-2 text-left">
                  보유·이용 기간
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-3 py-2">Supabase Inc.</td>
                <td className="border px-3 py-2">
                  회원 정보 저장 및 인증 처리, 데이터베이스 운영
                </td>
                <td className="border px-3 py-2">
                  대한민국 (Seoul 리전)
                </td>
                <td className="border px-3 py-2">
                  회원 탈퇴 또는 위탁계약 종료 시까지
                </td>
              </tr>
              <tr>
                <td className="border px-3 py-2">Vercel Inc.</td>
                <td className="border px-3 py-2">
                  웹 서비스 호스팅 및 배포
                </td>
                <td className="border px-3 py-2">
                  대한민국 (Seoul Edge)
                </td>
                <td className="border px-3 py-2">
                  위탁계약 종료 시까지
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {SERVICE_NAME}은 「개인정보 보호법」 제26조에 따라 위탁계약
          시 개인정보의 안전한 처리를 위한 기술적·관리적 보호조치,
          재위탁 제한, 관리·감독 등 책임에 관한 사항을 계약에 반영하고
          있습니다.
        </p>
      </section>

      <section id="s6" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          6. 정보주체의 권리·의무 및 행사방법
        </h2>
        <p className="mb-3 leading-relaxed">
          정보주체는 {SERVICE_NAME}에 대해 언제든지 다음과 같은
          개인정보 보호 관련 권리를 행사할 수 있습니다.
        </p>
        <ol className="mb-3 list-decimal space-y-1 pl-6 leading-relaxed">
          <li>개인정보 열람 요구</li>
          <li>개인정보 정정·삭제 요구</li>
          <li>개인정보 처리정지 요구</li>
          <li>개인정보 처리에 대한 동의 철회</li>
        </ol>
        <p className="leading-relaxed">
          권리 행사는{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-blue-600 underline"
          >
            {CONTACT_EMAIL}
          </a>
          로 서면, 이메일 등을 통하여 하실 수 있으며 {SERVICE_NAME}은
          이에 대해 지체 없이 조치하겠습니다.
        </p>
      </section>

      <section id="s7" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          7. 개인정보의 안전성 확보 조치
        </h2>
        <ul className="list-disc space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>기술적 조치</strong>: 접근 권한 관리, 비밀번호
            단방향 암호화 저장, HTTPS 통신 암호화, Row Level
            Security(RLS) 적용
          </li>
          <li>
            <strong>관리적 조치</strong>: 개인정보 취급 담당자 최소화,
            정기적인 자체 점검
          </li>
          <li>
            <strong>물리적 조치</strong>: 국제 보안 인증(SOC2 등)을
            획득한 클라우드 인프라를 대한민국 리전에서 활용
          </li>
        </ul>
      </section>

      <section id="s8" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          8. 개인정보 자동 수집 장치(쿠키)의 설치·운영 및 거부
        </h2>
        <p className="mb-3 leading-relaxed">
          {SERVICE_NAME}은 로그인 상태 유지 및 이용자 맞춤 서비스
          제공을 위해 쿠키(cookie)를 사용합니다.
        </p>
        <ul className="list-disc space-y-2 pl-6 leading-relaxed">
          <li>
            <strong>사용 목적</strong>: 로그인 세션 유지, 이용자 환경
            설정 저장
          </li>
          <li>
            <strong>거부 방법</strong>: 웹브라우저 설정 &gt; 개인정보
            보호 및 보안 메뉴에서 쿠키 저장을 거부할 수 있습니다.
            다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스
            이용에 어려움이 있을 수 있습니다.
          </li>
        </ul>
      </section>

      <section id="s9" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          9. 개인정보 보호책임자
        </h2>
        <p className="mb-3 leading-relaxed">
          {SERVICE_NAME}은 개인정보 처리에 관한 업무를 총괄하여
          책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및
          피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
          지정하고 있습니다.
        </p>
        <div className="rounded-lg border bg-gray-50 p-4 leading-relaxed">
          <p>
            <strong>개인정보 보호책임자</strong>: {OPERATOR_NAME}
          </p>
          <p>
            <strong>연락처</strong>:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-blue-600 underline"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>

      <section id="s10" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          10. 권익침해 구제방법
        </h2>
        <p className="mb-3 leading-relaxed">
          정보주체는 개인정보 침해로 인한 구제를 받기 위하여 아래
          기관에 분쟁 해결이나 상담 등을 신청할 수 있습니다.
        </p>
        <ul className="list-disc space-y-1 pl-6 leading-relaxed">
          <li>
            개인정보분쟁조정위원회: (국번없이) 1833-6972 (
            <a
              href="https://www.kopico.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 underline"
            >
              www.kopico.go.kr
            </a>
            )
          </li>
          <li>
            개인정보침해신고센터: (국번없이) 118 (
            <a
              href="https://privacy.kisa.or.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 underline"
            >
              privacy.kisa.or.kr
            </a>
            )
          </li>
          <li>
            대검찰청: (국번없이) 1301 (
            <a
              href="https://www.spo.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 underline"
            >
              www.spo.go.kr
            </a>
            )
          </li>
          <li>
            경찰청: (국번없이) 182 (
            <a
              href="https://ecrm.cyber.go.kr"
              target="_blank"
              rel="noreferrer noopener"
              className="text-blue-600 underline"
            >
              ecrm.cyber.go.kr
            </a>
            )
          </li>
        </ul>
      </section>

      <section id="s11" className="mb-10 scroll-mt-20">
        <h2 className="mb-4 text-xl font-bold">
          11. 개인정보 처리방침의 변경
        </h2>
        <p className="leading-relaxed">
          이 개인정보 처리방침은 {EFFECTIVE_DATE}부터 적용됩니다.
          법령, 정책 또는 보안기술 변경에 따라 내용이 추가·삭제 및
          수정될 경우 변경 사항을 시행일 7일 전부터 서비스 내
          공지사항을 통해 고지합니다.
        </p>
      </section>

      <footer className="mt-16 border-t pt-6 text-sm text-gray-500">
        <p>시행일: {EFFECTIVE_DATE}</p>
      </footer>
    </main>
  );
}
```

---

## Step 4: 적용 방법 안내 (생성 후 반드시 전달)

파일 생성 후 아래 안내를 함께 출력한다.

### 📌 완료 후 체크리스트

1. **푸터에 링크 추가** — 모든 페이지에서 접근 가능하도록 레이아웃 푸터에 삽입

   ```tsx
   <Link
     href="/privacy"
     className="text-sm text-gray-600 hover:underline"
   >
     개인정보 처리방침
   </Link>
   ```

2. **회원가입 폼에 동의 체크박스 추가**

   ```tsx
   <label className="flex items-start gap-2">
     <input type="checkbox" required />
     <span className="text-sm">
       [필수]{" "}
       <Link href="/privacy" className="underline">
         개인정보 수집·이용
       </Link>
       에 동의합니다.
     </span>
   </label>
   ```

3. **robots 허용 확인** — `/privacy` 경로가 `robots.txt`에서 차단되지 않도록 확인

4. **변경 시 의무** — 내용 변경 시 시행 7일 전 공지 필수 (`EFFECTIVE_DATE` 수정 시 주의)

---

## 작성 원칙 (개인정보보호위원회 지침 기준)

### ① 법령 부합성

- 개인정보보호법 제30조제1항 + 시행령 제31조제1항 각 호 내용을 **모두** 포함
- 작성 내용은 실제 처리 현황과 일치해야 함

### ② 투명성 및 정확성

- 수집하지 않는 항목을 기재하거나 수집하는 항목을 누락하면 위법
- 서비스 변경 시 처리방침도 함께 업데이트

### ③ 명확성 및 가독성

- **"~등" 같은 모호한 표현 금지** (법적 문제의 최다 원인)
- 평어체 권장, 표(table) 적극 활용
- 목차 및 하이퍼링크 제공 (본 템플릿에 포함됨)

### ④ 접근성

- 로그인 없이 누구나 쉽게 확인 가능한 방법으로 공개
- 제목은 **"개인정보 처리방침"** 표준 명칭 사용 (변형 금지)

---

## 자주 실수하는 지점 (경고)

| 실수                                 | 올바른 방식                            |
| ------------------------------------ | -------------------------------------- |
| "이메일 등"처럼 모호하게 기재        | "이메일, 비밀번호" 구체적으로 나열     |
| "회원 가입 및 서비스 개발 등의 목적" | 각 목적을 구분하여 구체적으로 기재     |
| 제목을 "프라이버시 정책"으로 변형    | **"개인정보 처리방침"** 표준 명칭 사용 |
| 보호책임자 연락처 누락               | 이메일 주소 필수 기재                  |
| 회원가입 시 동의 체크박스 없음       | 필수 동의 체크박스 반드시 추가         |
| 변경 시 공지 누락                    | 변경 7일 전 공지 필수                  |

### ⚠️ 스택이 바뀌면 재조정 필요

사용자가 아래 중 하나라도 추가하면 템플릿을 확장해야 함:

- **해외 리전 Supabase/Vercel 전환** → 국외 이전 섹션 **반드시 추가**
- **OpenAI/Anthropic 등 AI API 추가** → 위탁 + 국외 이전 섹션 추가
- **결제 연동** → 제3자 제공 또는 위탁 섹션 추가
- **Google Analytics 등 분석** → 자동 수집 장치 상세 + 거부 방법 추가
- **만 14세 미만 대상** → 법정대리인 동의 섹션 추가

---

## 참고 법령·자료

- **개인정보 보호법** 제30조 (개인정보 처리방침의 수립 및 공개)
- **개인정보 보호법 시행령** 제31조
- **표준 개인정보 보호지침** 제18조~제20조
- **개인정보 처리방침 작성지침 (2025.4., 개인정보보호위원회)**

**미수립·미공개 시 제재**: 1천만 원 이하 과태료 (개인정보보호법 제75조제2항)

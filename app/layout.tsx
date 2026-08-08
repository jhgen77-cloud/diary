import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { buildPageMetadata, SITE_NAME } from "@/lib/pageMetadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 오픈그래프 이미지 등 상대 경로를 절대 URL로 바꾸는 데 필요합니다. 실제
  // 배포 도메인이 정해지면 NEXT_PUBLIC_SITE_URL 환경 변수로 지정해주세요
  // (지정 안 하면 로컬 개발 주소로 대체됩니다).
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  ...buildPageMetadata(SITE_NAME),
  // 페이지별 metadata의 title(문자열)은 이 template을 통해 "그날을 거닐다 | 기억"
  // 형태로 자동 조합됩니다.
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {modal}
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const SITE_NAME = "기억";
export const DEFAULT_DESCRIPTION = "그날의 기억을 붙잡고, 다시 걸어보는 다이어리.";

// 파비콘으로 쓰는 로고(app/icon.png)를 오픈그래프 이미지로도 재사용합니다 —
// 정사각형이라 링크 미리보기용으로는 이상적인 비율(1200x630 등 가로형)은
// 아니지만, 별도로 준비된 오픈그래프 전용 이미지가 아직 없어 최소한의 미리보기
// 썸네일로 씁니다.
const OG_IMAGE = {
  url: "/icon.png",
  width: 419,
  height: 419,
  alt: SITE_NAME,
};

/** 페이지별 title/description으로 <title>과 오픈그래프/트위터 카드까지 일관되게
 * 채운 Metadata를 만듭니다.
 *
 * Next.js는 openGraph/twitter 같은 중첩 필드를 하위 세그먼트(페이지)가 정의하면
 * 부모(레이아웃) 값과 병합하지 않고 통째로 덮어씁니다 — 그래서 페이지마다
 * title/description만 바꿔 넣어도 siteName/이미지 같은 공통 필드가 루트
 * 레이아웃에서 그대로 이어지도록, 이 함수가 매번 공통 필드까지 함께 채웁니다. */
export function buildPageMetadata(title: string, description: string = DEFAULT_DESCRIPTION): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

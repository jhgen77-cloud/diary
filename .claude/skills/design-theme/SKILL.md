---
name: design-theme
description: Notion 스타일 UI 디자인 가이드. UI 스타일링, CSS, 디자인 작업 시 사용.
---

# Notion Style Design Guide

## 컬러 (라이트모드 — 기본값)

- 배경: #F7F7F5
- 카드/컨테이너 배경: #FFFFFF
- 텍스트 기본: #37352F
- 텍스트 보조: #9B9A97
- 플레이스홀더: #C4C4C0
- 보더: #E3E3E0
- 액센트(버튼, 링크): #2EAADC
- 액센트 호버: #2898C4
- 호버 배경: #F1F1EF
- 에러: #EB5757
- 성공: #4DAB9A

## 컬러 (다크모드)

- 배경: #191919
- 카드/컨테이너 배경: #202020
- 텍스트 기본: #E3E3E0
- 텍스트 보조: #6B6B6B
- 플레이스홀더: #4A4A4A
- 보더: #333333
- 액센트(버튼, 링크): #529CCA
- 액센트 호버: #68B5E1
- 호버 배경: #2F2F2F
- 에러: #EB5757
- 성공: #4DAB9A

## 타이포그래피

- 폰트: 시스템 기본 산세리프 (-apple-system, BlinkMacSystemFont, sans-serif)
- 제목(h1): 30px, bold, line-height: 1.2
- 부제목(h2): 20px, semibold, line-height: 1.3
- 본문: 16px, regular, line-height: 1.6
- 보조 텍스트: 14px, regular, line-height: 1.4
- 링크: 액센트 컬러, underline 없음, 호버 시 underline

## 레이아웃

- 최대 너비: 720px, 가운데 정렬
- 페이지 좌우 패딩: 24px
- 페이지 상단 패딩: 40px
- 섹션 간 간격: 32px
- 요소 간 간격: 16px

## 컴포넌트

### 카드

- 흰색 배경, 1px 보더(보더 컬러), border-radius 8px, 패딩 16px
- 그림자 없음
- 호버 시 배경 #F7F7F5(라이트) / #2F2F2F(다크)

### 버튼

- 기본: 액센트 컬러 배경, 흰색 텍스트, border-radius 6px, 패딩 8px 16px, font-size 14px
- 호버: 액센트 호버 컬러
- 비활성: opacity 0.4, cursor not-allowed
- 보조 버튼: 투명 배경, 1px 보더(보더 컬러), 텍스트 기본 컬러

### 입력 필드

- 1px 보더(보더 컬러), border-radius 6px, 패딩 8px 12px, font-size 16px
- 포커스: 보더 컬러 → 액센트 컬러, outline 없음
- 플레이스홀더: 플레이스홀더 컬러
- 에러 상태: 보더 컬러 → 에러 컬러

### 셀렉트

- 입력 필드와 동일한 스타일
- 화살표 아이콘 우측 배치

### 뱃지/태그

- 배경 #F1F1EF(라이트) / #2F2F2F(다크), 텍스트 기본 컬러
- border-radius 4px, 패딩 2px 8px, font-size 13px

### 리스트 아이템

- 아이템 간 1px 보더 구분선
- 패딩 상하 12px
- 호버 시 배경색 변경

### 네비게이션

- 페이지 상단 고정, 배경 반투명(backdrop-filter: blur(8px))
- 높이 48px, 좌우 패딩 16px
- 로고/제목: 16px, semibold

## 트랜지션

- 모든 색상 변경: transition 0.15s ease
- 호버/포커스 전환이 부드럽게

## 스타일 원칙

- 그림자 사용하지 않음 (플랫하게)
- 둥근 모서리 (6~8px)
- 여백 넉넉하게
- 호버 시 배경색 살짝 변경
- 전체적으로 따뜻하고 깔끔한 느낌
- 장식적 요소 최소화, 콘텐츠 중심

## 구현 규칙 (MUST FOLLOW)

- **배경과 텍스트 명암비는 최소 3:1을 유지한다** — 보조 텍스트(text-sub)도 포함. 명암비가 낮으면 색을 어둡게 조정한다.
- **라이트모드만 구현한다** — 다크모드(`@media (prefers-color-scheme: dark)`, `.dark` 클래스 등) 는 추가하지 않는다.

- **CSS 변수는 `globals.css`에 정의하고, Tailwind arbitrary value로만 참조한다** — `bg-[var(--accent)]`, `text-[var(--text-sub)]` 형태로 사용. `style={{ color: "var(--text)" }}` 같은 inline style과 절대 혼용하지 않는다.
- **hover 효과는 반드시 `globals.css`에 CSS 클래스로 정의한다** — Next.js 서버 컴포넌트에서는 `onMouseEnter`/`onMouseLeave` 같은 JS 이벤트 핸들러를 사용할 수 없다. 예: `.card-hover:hover { background: var(--hover-bg); }`
- **서버 컴포넌트 props에 이벤트 핸들러(onClick 등)를 넘기지 않는다** — 인터랙션이 필요하면 `"use client"` 컴포넌트로 분리한다.
- **스타일링 방식을 한 가지로 통일한다** — Tailwind를 쓰기로 했으면 Tailwind만, inline style을 쓰기로 했으면 inline style만. 한 컴포넌트 안에서 두 방식을 섞지 않는다.

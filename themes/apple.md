---
name: design-theme
description: Apple 스타일 UI 디자인 가이드. UI 스타일링, CSS, 디자인 작업 시 사용.
---

# Apple Style Design Guide

## 컬러 (라이트모드 — 기본값)

- 배경: #FFFFFF
- 카드/컨테이너 배경: #FBFBFD
- 텍스트 기본: #1D1D1F
- 텍스트 보조: #86868B
- 플레이스홀더: #AEAEB2
- 보더: #D2D2D7
- 액센트(버튼, 링크): #0071E3
- 액센트 호버: #0077ED
- 구분선: #E8E8ED
- 에러: #FF3B30
- 성공: #34C759

## 컬러 (다크모드)

- 배경: #000000
- 카드/컨테이너 배경: #1C1C1E
- 텍스트 기본: #F5F5F7
- 텍스트 보조: #86868B
- 플레이스홀더: #48484A
- 보더: #38383A
- 액센트(버튼, 링크): #2997FF
- 액센트 호버: #40A9FF
- 구분선: #38383A
- 에러: #FF453A
- 성공: #30D158

## 타이포그래피

- 폰트: 시스템 기본 산세리프 (-apple-system, BlinkMacSystemFont, sans-serif)
- 제목(h1): 40px, semibold, line-height: 1.1, letter-spacing: -0.5px
- 부제목(h2): 24px, semibold, line-height: 1.2, letter-spacing: -0.3px
- 본문: 17px, regular, line-height: 1.5
- 보조 텍스트: 14px, regular, line-height: 1.4
- 링크: 액센트 컬러, underline 없음, 호버 시 underline
- 제목은 크고 굵게, letter-spacing 좁게 (애플 특유)

## 레이아웃

- 최대 너비: 680px, 가운데 정렬
- 페이지 좌우 패딩: 24px
- 페이지 상단 패딩: 56px (여백 매우 넉넉)
- 섹션 간 간격: 48px
- 요소 간 간격: 20px

## 컴포넌트

### 카드

- 배경 #FBFBFD(라이트) / #1C1C1E(다크), 보더 없음, border-radius 12px, 패딩 24px
- 그림자 없음 또는 매우 미세 (box-shadow: 0 1px 3px rgba(0,0,0,0.04))
- 호버 시 변화 최소 (배경 미세 변경 정도)

### 버튼

- 기본: 액센트 컬러 배경, 흰색 텍스트, border-radius 980px (pill), 패딩 12px 24px, font-size 17px
- 호버: 액센트 호버 컬러
- 비활성: opacity 0.3, cursor not-allowed
- 보조 버튼: 투명 배경, 액센트 컬러 텍스트, 보더 없음, 호버 시 underline

### 입력 필드

- 1px 보더(보더 컬러), border-radius 10px, 패딩 12px 16px, font-size 17px
- 포커스: 보더 컬러 → 액센트 컬러, box-shadow: 0 0 0 3px rgba(0,113,227,0.2)
- 플레이스홀더: 플레이스홀더 컬러
- 에러 상태: 보더 컬러 → 에러 컬러

### 셀렉트

- 입력 필드와 동일한 스타일
- 화살표 아이콘 우측 배치

### 뱃지/태그

- 배경 #F5F5F7(라이트) / #2C2C2E(다크), 텍스트 기본 컬러
- border-radius 980px (pill), 패딩 4px 12px, font-size 13px

### 리스트 아이템

- 아이템 간 1px 구분선(구분선 컬러)
- 패딩 상하 16px
- 호버 시 배경 미세 변경

### 네비게이션

- 페이지 상단 고정, 반투명 배경(backdrop-filter: saturate(180%) blur(20px))
- 배경: rgba(255,255,255,0.72)(라이트) / rgba(0,0,0,0.72)(다크)
- 높이 48px, 좌우 패딩 24px
- 하단 1px 구분선
- 로고/제목: 17px, semibold

## 트랜지션

- 모든 색상 변경: transition 0.3s ease
- 절제된 트랜지션, 과한 애니메이션 금지

## 스타일 원칙

- 극도로 미니멀, 불필요한 요소 제거
- 여백을 매우 넉넉하게 사용 (의심되면 더 넓게)
- 흑백 중심, 액센트 컬러는 CTA에만 최소 사용
- 버튼은 pill 형태 (완전히 둥근)
- 깔끔하고 고급스러운 느낌
- 장식보다 타이포그래피로 위계 표현

## 구현 규칙 (MUST FOLLOW)

- **배경과 텍스트 명암비는 최소 3:1을 유지한다** — 보조 텍스트(text-sub)도 포함. 명암비가 낮으면 색을 어둡게 조정한다.
- **라이트모드만 구현한다** — 다크모드(`@media (prefers-color-scheme: dark)`, `.dark` 클래스 등) 는 추가하지 않는다.

- **CSS 변수는 `globals.css`에 정의하고, Tailwind arbitrary value로만 참조한다** — `bg-[var(--accent)]`, `text-[var(--text-sub)]` 형태로 사용. `style={{ color: "var(--text)" }}` 같은 inline style과 절대 혼용하지 않는다.
- **hover 효과는 반드시 `globals.css`에 CSS 클래스로 정의한다** — Next.js 서버 컴포넌트에서는 `onMouseEnter`/`onMouseLeave` 같은 JS 이벤트 핸들러를 사용할 수 없다. 예: `.card-hover:hover { background: var(--hover-bg); }`
- **서버 컴포넌트 props에 이벤트 핸들러(onClick 등)를 넘기지 않는다** — 인터랙션이 필요하면 `"use client"` 컴포넌트로 분리한다.
- **스타일링 방식을 한 가지로 통일한다** — Tailwind를 쓰기로 했으면 Tailwind만, inline style을 쓰기로 했으면 inline style만. 한 컴포넌트 안에서 두 방식을 섞지 않는다.

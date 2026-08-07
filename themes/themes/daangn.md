---
name: design-theme
description: 당근 스타일 UI 디자인 가이드. UI 스타일링, CSS, 디자인 작업 시 사용.
---

# Daangn (당근) Style Design Guide

## 컬러 (라이트모드 — 기본값)

- 배경: #FFFFFF
- 카드/컨테이너 배경: #FFFFFF
- 텍스트 기본: #212124
- 텍스트 보조: #868B94
- 플레이스홀더: #AEB5BC
- 보더: #EBEBEB
- 액센트(버튼, 링크): #FF6F0F
- 액센트 호버: #E5630D
- 호버 배경: #FFF5EF
- 비활성 배경: #F4F4F4
- 에러: #F04452
- 성공: #1FC077

## 컬러 (다크모드)

- 배경: #1A1A1A
- 카드/컨테이너 배경: #242424
- 텍스트 기본: #ECECEC
- 텍스트 보조: #8E8E93
- 플레이스홀더: #555555
- 보더: #333333
- 액센트(버튼, 링크): #FF8A3D
- 액센트 호버: #FF9E5E
- 호버 배경: #2E2117
- 비활성 배경: #2A2A2A
- 에러: #F04452
- 성공: #1FC077

## 타이포그래피

- 폰트: 시스템 기본 산세리프 (-apple-system, BlinkMacSystemFont, sans-serif)
- 제목(h1): 24px, bold, line-height: 1.3
- 부제목(h2): 18px, bold, line-height: 1.4
- 본문: 16px, regular, line-height: 1.5
- 보조 텍스트: 13px, regular, line-height: 1.4
- 링크: 액센트 컬러, underline 없음, 호버 시 opacity 0.8

## 레이아웃

- 최대 너비: 640px, 가운데 정렬
- 페이지 좌우 패딩: 16px
- 페이지 상단 패딩: 32px
- 섹션 간 간격: 24px
- 요소 간 간격: 12px

## 컴포넌트

### 카드

- 흰색 배경, 1px 보더(보더 컬러), border-radius 12px, 패딩 16px
- 그림자 없음
- 호버 시 배경 호버 배경 컬러

### 버튼

- 기본: 액센트 컬러 배경, 흰색 텍스트, border-radius 8px, 패딩 12px 20px, font-size 16px, bold
- 호버: 액센트 호버 컬러
- 비활성: 배경 비활성 컬러, 텍스트 보조 컬러, cursor not-allowed
- 보조 버튼: 배경 #FFF5EF(라이트) / #2E2117(다크), 텍스트 액센트 컬러, 보더 없음

### 입력 필드

- 1px 보더(보더 컬러), border-radius 8px, 패딩 12px 14px, font-size 16px
- 포커스: 보더 컬러 → 액센트 컬러, outline 없음
- 플레이스홀더: 플레이스홀더 컬러
- 에러 상태: 보더 컬러 → 에러 컬러, 하단에 에러 메시지(13px, 에러 컬러)

### 셀렉트

- 입력 필드와 동일한 스타일
- 화살표 아이콘 우측 배치

### 뱃지/태그

- 배경 #FFF5EF(라이트) / #2E2117(다크), 텍스트 액센트 컬러
- border-radius 6px, 패딩 4px 8px, font-size 13px

### 리스트 아이템

- 아이템 간 1px 구분선(보더 컬러)
- 패딩 상하 14px
- 호버 시 배경 호버 배경 컬러
- 마지막 아이템에는 구분선 없음

### 네비게이션

- 페이지 상단 고정, 배경 흰색(라이트) / #1A1A1A(다크)
- 높이 52px, 좌우 패딩 16px
- 하단 1px 보더(보더 컬러)
- 로고/제목: 18px, bold

## 트랜지션

- 모든 색상 변경: transition 0.15s ease
- 버튼 클릭: transform scale(0.97)로 살짝 눌리는 느낌

## 스타일 원칙

- 오렌지 포인트 컬러로 따뜻하고 친근한 느낌
- 둥근 모서리 (8~12px)
- 리스트 아이템은 구분선으로 나누기
- 몽글몽글하고 부드러운 인상
- 전체적으로 밝고 깨끗한 화면
- 보더 기반, 그림자는 사용하지 않음

## 구현 규칙 (MUST FOLLOW)

- **배경과 텍스트 명암비는 최소 3:1을 유지한다** — 보조 텍스트(text-sub)도 포함. 명암비가 낮으면 색을 어둡게 조정한다.
- **라이트모드만 구현한다** — 다크모드(`@media (prefers-color-scheme: dark)`, `.dark` 클래스 등) 는 추가하지 않는다.

- **CSS 변수는 `globals.css`에 정의하고, Tailwind arbitrary value로만 참조한다** — `bg-[var(--accent)]`, `text-[var(--text-sub)]` 형태로 사용. `style={{ color: "var(--text)" }}` 같은 inline style과 절대 혼용하지 않는다.
- **hover 효과는 반드시 `globals.css`에 CSS 클래스로 정의한다** — Next.js 서버 컴포넌트에서는 `onMouseEnter`/`onMouseLeave` 같은 JS 이벤트 핸들러를 사용할 수 없다. 예: `.card-hover:hover { background: var(--hover-bg); }`
- **서버 컴포넌트 props에 이벤트 핸들러(onClick 등)를 넘기지 않는다** — 인터랙션이 필요하면 `"use client"` 컴포넌트로 분리한다.
- **스타일링 방식을 한 가지로 통일한다** — Tailwind를 쓰기로 했으면 Tailwind만, inline style을 쓰기로 했으면 inline style만. 한 컴포넌트 안에서 두 방식을 섞지 않는다.

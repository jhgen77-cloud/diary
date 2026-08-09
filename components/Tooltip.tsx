"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface TooltipProps {
  /** 호버(또는 키보드 포커스) 시 자식 요소 위에 살짝 떠오르는 짧은 안내 문구. */
  label: string;
  children: ReactNode;
  /** 감싸는 span에 덧붙일 클래스. 레이아웃(폭/높이 등)을 자식에 맞춰야 할 때 씁니다. */
  className?: string;
  /** children 자체가 포커스 가능한 요소(Link, button 등)가 아닐 때 true로 넘기면,
   * 감싸는 span을 탭 순서에 포함시켜 키보드로도 툴팁을 띄울 수 있게 합니다. */
  focusable?: boolean;
  /** 툴팁 말풍선을 children의 오른쪽("end", 기본값) 가장자리에 맞출지 왼쪽
   * ("start") 가장자리에 맞출지. children이 모달/화면의 왼쪽 가장자리에
   * 가까이 있으면(예: 툴바 맨 앞의 아이콘), "end"로는 말풍선이 왼쪽으로
   * 넘쳐 모달 밖으로 벗어날 수 있어 이럴 때 "start"를 씁니다. */
  align?: "start" | "end";
  /** true면, 호버가 없는 기기(터치)에서 첫 탭은 클릭/터치 동작 대신 툴팁만
   * 띄우고, 그다음 탭에야 실제 동작(링크 이동, 버튼 클릭 등)이 일어나게
   * 합니다. 아이콘만 있고 곁에 글자 라벨이 전혀 없어 툴팁이 유일한 설명
   * 수단인 곳(설정/정보 아이콘, 이미지 첨부 도구 아이콘 등)에만 켭니다 —
   * 이미 곁에 글자 라벨이 보이는 대부분의 툴팁에는 굳이 필요 없고, 오히려
   * "한 번 더 탭해야 동작한다"는 불편만 추가하게 됩니다. */
  tapToReveal?: boolean;
}

/** 자식 요소 위에 호버/포커스하면 label을 위쪽에 짧게 띄워 보여주는 툴팁. 기본은
 * 순수 CSS(이름 붙인 그룹의 hover/focus-visible)로만 동작해 별도 상태나 포털이
 * 필요 없습니다. 명명된 그룹(group/tooltip)을 써서, children이 자체적으로 쓰는
 * 다른 group(예: DiaryMenuItem의 이미지 확대 효과)과 서로 간섭하지 않습니다.
 *
 * focus-within이 아니라 focus-visible을 기준으로 삼습니다 — children이 버튼일
 * 때, 버튼을 클릭하면 (호버가 끝난 뒤에도) 계속 포커스가 남아 focus-within이
 * 계속 참이 되고, 그 상태로 마우스가 다른 버튼으로 넘어가면 두 툴팁이 동시에
 * 떠 있는 문제가 있었습니다(실제로 재현해 확인함). focus-visible은 마우스
 * 클릭으로 얻은 포커스에는 적용되지 않고(브라우저가 알아서 구분) 키보드 Tab
 * 이동으로 얻은 포커스에만 적용되므로, 클릭 후 잔상은 사라지고 키보드
 * 접근성은 그대로 유지됩니다.
 *
 * tapToReveal=true면 여기에 더해, 호버 자체가 불가능한 터치 기기에서는 첫 탭을
 * 가로채(preventDefault + stopPropagation) 툴팁만 보여주고, 실제 동작은 그
 * 다음 탭에야 일어나게 합니다 — 마우스는 "호버로 미리 보기 → 클릭으로 실행"
 * 두 동작이 분리되어 있지만, 터치는 탭 하나가 곧 실행이라 아이콘만 있는
 * 버튼의 의미를 미리 확인할 방법이 없었던 문제(실제로 지적받은 문제)를
 * 보완합니다. */
export default function Tooltip({
  label,
  children,
  className,
  focusable = false,
  align = "end",
  tapToReveal = false,
}: TooltipProps) {
  const [revealed, setRevealed] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!revealed) return;
    function handleOutside(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setRevealed(false);
      }
    }
    // 계속 떠 있으면 다음에 뭘 누르려는지 헷갈리니, 일정 시간 뒤엔 스스로
    // 닫혀서(다시 탭하면 재노출) 화면에 눌어붙지 않게 합니다.
    const timer = setTimeout(() => setRevealed(false), 2500);
    document.addEventListener("pointerdown", handleOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleOutside);
    };
  }, [revealed]);

  function handleClickCapture(event: React.MouseEvent<HTMLSpanElement>) {
    if (!tapToReveal || revealed) return; // 기능 꺼짐이거나 이미 한 번 보여준 뒤(=실제 동작을 막지 않음)
    // 호버 가능한 기기(마우스/트랙패드)는 이미 호버로 미리 보여줬을 것이므로
    // 가로챌 필요가 없습니다 — 터치처럼 호버가 아예 없는 기기에서만 가로챕니다.
    if (typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setRevealed(true);
  }

  // display 유틸리티(inline-block/block 등)는 className 쪽과 겹치면 어느 쪽이
  // 이길지 클래스 작성 순서로 보장되지 않습니다(둘 다 같은 우선순위의 유틸리티
  // 클래스). 그래서 기본값(inline-block)은 className이 없을 때만 적용해, 호출부가
  // 직접 display를 지정하면 그 값 하나만 남도록 합니다.
  return (
    <span
      ref={wrapperRef}
      className={`group/tooltip relative ${className ?? "inline-block"}`}
      tabIndex={focusable ? 0 : undefined}
      onClickCapture={tapToReveal ? handleClickCapture : undefined}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute -top-2 z-20 -translate-y-full text-xs whitespace-nowrap text-[var(--text)] opacity-0 transition-all duration-150 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:scale-100 group-focus-visible/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:scale-100 group-has-[:focus-visible]/tooltip:opacity-100 ${
          revealed ? "scale-100 opacity-100" : "scale-95"
        } ${align === "start" ? "left-0" : "right-0"}`}
      >
        {label}
      </span>
    </span>
  );
}

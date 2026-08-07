import type { ReactNode } from "react";

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
}

/** 자식 요소 위에 호버/포커스하면 label을 위쪽에 짧게 띄워 보여주는 툴팁. 순수
 * CSS(이름 붙인 그룹의 hover/focus-visible)로만 동작해 별도 상태나 포털이 필요
 * 없습니다. 명명된 그룹(group/tooltip)을 써서, children이 자체적으로 쓰는 다른
 * group(예: DiaryMenuItem의 이미지 확대 효과)과 서로 간섭하지 않습니다.
 *
 * focus-within이 아니라 focus-visible을 기준으로 삼습니다 — children이 버튼일
 * 때, 버튼을 클릭하면 (호버가 끝난 뒤에도) 계속 포커스가 남아 focus-within이
 * 계속 참이 되고, 그 상태로 마우스가 다른 버튼으로 넘어가면 두 툴팁이 동시에
 * 떠 있는 문제가 있었습니다(실제로 재현해 확인함). focus-visible은 마우스
 * 클릭으로 얻은 포커스에는 적용되지 않고(브라우저가 알아서 구분) 키보드 Tab
 * 이동으로 얻은 포커스에만 적용되므로, 클릭 후 잔상은 사라지고 키보드
 * 접근성은 그대로 유지됩니다. */
export default function Tooltip({
  label,
  children,
  className,
  focusable = false,
  align = "end",
}: TooltipProps) {
  // display 유틸리티(inline-block/block 등)는 className 쪽과 겹치면 어느 쪽이
  // 이길지 클래스 작성 순서로 보장되지 않습니다(둘 다 같은 우선순위의 유틸리티
  // 클래스). 그래서 기본값(inline-block)은 className이 없을 때만 적용해, 호출부가
  // 직접 display를 지정하면 그 값 하나만 남도록 합니다.
  return (
    <span
      className={`group/tooltip relative ${className ?? "inline-block"}`}
      tabIndex={focusable ? 0 : undefined}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute -top-2 z-20 -translate-y-full scale-95 text-xs whitespace-nowrap text-[var(--text)] opacity-0 transition-all duration-150 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-visible/tooltip:scale-100 group-focus-visible/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:scale-100 group-has-[:focus-visible]/tooltip:opacity-100 ${
          align === "start" ? "left-0" : "right-0"
        }`}
      >
        {label}
      </span>
    </span>
  );
}

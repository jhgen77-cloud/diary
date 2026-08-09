import HelpSection from "@/components/HelpSection";
import { HELP_SECTIONS } from "@/lib/helpContent";

/** 도움말 페이지 본문. "기억 사용자 도움말(1).docx" 내용을 lib/helpContent.ts로
 * 정리해두고, 구획마다 HelpSection으로 그립니다. 내용이 길어 모달 안에서
 * 세로 스크롤이 필요합니다 — Modal의 children 영역 자체엔 스크롤이 없어(다른
 * 화면들과 같은 이유) 이 컴포넌트가 직접 overflow-y-auto를 갖습니다. */
export default function HelpContent() {
  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {HELP_SECTIONS.map((section) => (
        <HelpSection key={section.heading} section={section} />
      ))}
    </div>
  );
}

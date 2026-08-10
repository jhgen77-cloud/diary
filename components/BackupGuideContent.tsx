import HelpSection from "@/components/HelpSection";
import { BACKUP_GUIDE_SECTIONS } from "@/lib/backupGuideContent";

/** 데이터 백업 및 복원방법 안내 페이지 본문. "기억 사용자 도움말(2).docx" 내용을
 * lib/backupGuideContent.ts로 정리해두고, HelpContent와 같은 방식(구획마다
 * HelpSection)으로 그립니다. app/info/help/page.tsx의 "※ 데이터 백업 및
 * 복원방법 안내" 링크로 들어옵니다. 내용이 길어 모달 안에서 세로 스크롤이
 * 필요합니다 — Modal의 children 영역 자체엔 스크롤이 없어(HelpContent와
 * 같은 이유) 이 컴포넌트가 직접 overflow-y-auto를 갖습니다. */
export default function BackupGuideContent() {
  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      {BACKUP_GUIDE_SECTIONS.map((section) => (
        <HelpSection key={section.heading} section={section} />
      ))}
    </div>
  );
}

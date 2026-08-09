import Link from "next/link";
import type { HelpSectionData } from "@/lib/helpContent";

interface HelpSectionProps {
  section: HelpSectionData;
}

/** 도움말 페이지 한 구획(예: "일기쓰기") — 제목 + 항목 목록. HelpContent가
 * lib/helpContent.ts의 각 구획마다 하나씩 그립니다. */
export default function HelpSection({ section }: HelpSectionProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] p-3 sm:p-4">
      <p className="text-sm font-semibold break-keep text-[var(--text)] sm:text-base">
        {section.heading}
      </p>
      <ul className="flex flex-col gap-2.5">
        {section.items.map((item) => (
          <li key={item.title} className="flex flex-col gap-1">
            <p className="text-xs font-medium break-keep text-[var(--text)] sm:text-sm">
              {item.title}
            </p>
            <p className="text-xs break-keep text-[var(--text-sub)] sm:text-sm">
              {item.description}
            </p>
            {item.subItems && (
              <ul className="mt-0.5 flex flex-col gap-1 pl-3">
                {item.subItems.map((sub) => (
                  <li
                    key={sub}
                    className="list-disc break-keep text-[0.7rem] text-[var(--text-sub)] marker:text-[var(--border)] sm:text-xs"
                  >
                    {sub}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {section.links && (
        // "※ 데이터 백업 및 복원방법 안내" 같은 하이퍼링크 문구는 폰트 색상을
        // 검정색으로 해달라는 요구사항 때문에 text-[var(--accent)] 대신
        // text-black을 씁니다(이 앱엔 다크 테마가 없어 고정값이 안전합니다).
        <div className="mt-1 flex flex-col gap-1 border-t border-[var(--border)] pt-2">
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs break-keep text-black hover:underline sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

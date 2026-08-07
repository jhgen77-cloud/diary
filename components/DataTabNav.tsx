import Tooltip from "@/components/Tooltip";

export type DataTabKey = "restore" | "export" | "reset";

interface DataTab {
  key: DataTabKey;
  label: string;
  /** 시적인 탭 이름 옆에 덧붙이는 툴팁 — 실제 기능을 그대로 풀어 쓴 문구. */
  tooltip: string;
}

const TABS: DataTab[] = [
  { key: "restore", label: "기억의 귀환", tooltip: "가져오기" },
  { key: "export", label: "기억의 날개", tooltip: "내보내기" },
  { key: "reset", label: "기억의 소멸", tooltip: "데이터초기화" },
];

interface DataTabNavProps {
  active: DataTabKey;
  onChange: (tab: DataTabKey) => void;
}

export default function DataTabNav({ active, onChange }: DataTabNavProps) {
  return (
    <div
      role="tablist"
      aria-label="데이터 관리"
      // mt-2: 옆 사이드바(DataSidebar)의 p-3 안쪽 여백 때문에 '기억의 조율' 텍스트가
      // 박스 위쪽 경계선(=이 탭 목록이 붙어 있는 제목 경계선)보다 살짝 아래에서
      // 시작합니다. 탭 버튼 자체는 padding이 더 얇아(py-1.5) 경계선에 더 붙어
      // 보였던 차이를 이만큼 내려서 두 텍스트의 시작 높이를 맞춥니다(실측 8px 차이).
      className="mt-2 flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2"
    >
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <Tooltip key={tab.key} label={tab.tooltip}>
            <button
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                selected
                  ? "bg-[var(--accent)] text-white"
                  : "border border-[var(--border)] text-[var(--text-sub)] hover:bg-[var(--hover)]"
              }`}
            >
              {tab.label}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}

export type DataTabKey = "restore" | "export" | "reset";

interface DataTab {
  key: DataTabKey;
  label: string;
}

const TABS: DataTab[] = [
  { key: "restore", label: "기억의 귀환" },
  { key: "export", label: "기억의 날개" },
  { key: "reset", label: "기억의 소멸" },
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
      className="flex shrink-0 flex-wrap items-center gap-1.5 sm:gap-2"
    >
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              selected
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-black/10 text-black/70 hover:bg-black/[.06] dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

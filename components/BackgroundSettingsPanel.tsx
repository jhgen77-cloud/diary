import ColorPalette from "@/components/ColorPalette";
import type { EnvironmentSettings } from "@/lib/environmentSettings";

// FontSettingsPanel과 같은 고정 폭(요구사항 — "폰트크기" 라벨 기준)으로 맞춘 라벨.
const rowLabelClass =
  "w-20 shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:w-24 sm:px-3 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300";

// DataTabNav/TextAlignmentSelect와 같은 알약형 라디오 버튼 스타일. DataOptionRadio는
// 세로로 쌓는 목록용(w-full)이라, "없음/단색"처럼 가로로 나란히 놓는 여기엔 맞지
// 않아 이 스타일을 재사용했습니다.
const typeButtonClass = (selected: boolean) =>
  `rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
    selected
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "border border-black/10 text-black/70 hover:bg-black/[.06] dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
  }`;

interface BackgroundSettingsPanelProps {
  settings: EnvironmentSettings;
  onChange: (update: Partial<EnvironmentSettings>) => void;
}

/** 배경설정 — 배경타입(없음/단색)을 고르고, "단색"일 때만 색상 선택 버튼이
 * 활성화되어 Color Palette로 배경색을 고를 수 있습니다. FontSettingsPanel과
 * 마찬가지로 부모의 초안(draft)만 고치고, 실제 저장소엔 확인·적용을 눌러야
 * 반영됩니다(요구사항). */
export default function BackgroundSettingsPanel({
  settings,
  onChange,
}: BackgroundSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
      <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
        배경설정
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>배경타입</span>
        <div role="radiogroup" aria-label="배경타입" className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            role="radio"
            aria-checked={settings.backgroundType === "none"}
            onClick={() => onChange({ backgroundType: "none" })}
            className={typeButtonClass(settings.backgroundType === "none")}
          >
            없음
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={settings.backgroundType === "solid"}
            onClick={() => onChange({ backgroundType: "solid" })}
            className={typeButtonClass(settings.backgroundType === "solid")}
          >
            단색
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>배경색상</span>
        {/* 배경타입이 "없음"이면 비활성화 — 요구사항. */}
        <ColorPalette
          value={settings.backgroundColor}
          onChange={(backgroundColor) => onChange({ backgroundColor })}
          disabled={settings.backgroundType !== "solid"}
        />
      </div>
    </div>
  );
}

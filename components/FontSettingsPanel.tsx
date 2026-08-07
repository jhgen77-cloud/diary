import FontFamilySelect from "@/components/FontFamilySelect";
import FontSizeSlider from "@/components/FontSizeSlider";
import ColorPalette from "@/components/ColorPalette";
import TextAlignmentSelect from "@/components/TextAlignmentSelect";
import type { EnvironmentSettings } from "@/lib/environmentSettings";

// DataResetPanel의 '기억의 은하'/'기억의 소멸' 같은 항목 라벨과 같은 스타일이되,
// 폭을 "폰트크기"(가장 긴 라벨) 기준의 고정 폭으로 맞춰(요구사항) 글자 수가
// 다른 "폰트명"/"색상"도 같은 크기의 박스로 보이게 합니다(text-center로 짧은
// 글자는 가운데 정렬).
const rowLabelClass =
  "w-20 shrink-0 rounded-lg border border-black/10 px-2 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:w-24 sm:px-3 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300";

interface FontSettingsPanelProps {
  settings: EnvironmentSettings;
  onChange: (update: Partial<EnvironmentSettings>) => void;
}

/** 폰트설정 — 폰트명(Font Family)·폰트크기(Font Size)·정렬기준(Text Alignment)·
 * 색상 모두 실제로 값을 바꿀 수 있습니다. 값을 직접 저장소에 쓰지 않고 부모
 * (SettingsManager)가 들고 있는 '초안(draft)'을 읽고/고치기만 합니다 — 확인·
 * 적용을 눌러야 실제로 반영되고, 취소하면 그대로 버려지게 하기 위해서입니다
 * (요구사항). */
export default function FontSettingsPanel({ settings, onChange }: FontSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/[.06] p-3 dark:border-white/[.08]">
      <p className="text-xs font-semibold text-black sm:text-sm dark:text-zinc-50">
        폰트설정
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>폰트명</span>
        <FontFamilySelect
          value={settings.fontFamily}
          onChange={(fontFamily) => onChange({ fontFamily })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>폰트크기</span>
        <FontSizeSlider
          value={settings.fontSize}
          onChange={(fontSize) => onChange({ fontSize })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>색상</span>
        <ColorPalette
          value={settings.fontColor}
          onChange={(fontColor) => onChange({ fontColor })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={rowLabelClass}>정렬기준</span>
        <TextAlignmentSelect
          value={settings.textAlign}
          onChange={(textAlign) => onChange({ textAlign })}
        />
      </div>
    </div>
  );
}

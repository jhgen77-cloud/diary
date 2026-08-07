import { FONT_FAMILY_CSS } from "@/components/FontFamilySelect";
import type { BackgroundType, FontFamilyKey, TextAlignKey } from "@/lib/environmentSettings";

interface DiaryContentFieldProps {
  value: string;
  onChange: (content: string) => void;
  /** 환경 설정("시간을 붙잡다" 전용) — 본문란은 다섯 항목 모두 적용됩니다.
   * 모두 생략하면 이 필드가 쓰이는 다른 곳(있다면)엔 영향 없이 기본 스타일
   * 그대로입니다. */
  fontFamily?: FontFamilyKey;
  fontSize?: number;
  fontColor?: string;
  textAlign?: TextAlignKey;
  backgroundType?: BackgroundType;
  backgroundColor?: string;
}

export default function DiaryContentField({
  value,
  onChange,
  fontFamily,
  fontSize,
  fontColor,
  textAlign,
  backgroundType,
  backgroundColor,
}: DiaryContentFieldProps) {
  return (
    <div
      style={{
        backgroundColor: backgroundType === "solid" ? backgroundColor : undefined,
      }}
      className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--border)] p-3 sm:p-4"
    >
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="오늘 하루를 기록해보세요"
        style={{
          fontFamily: fontFamily ? FONT_FAMILY_CSS[fontFamily] : undefined,
          fontSize: fontSize ? `${fontSize}px` : undefined,
          color: fontColor,
          textAlign,
        }}
        className="min-h-0 flex-1 resize-none bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] sm:text-base"
      />
    </div>
  );
}

import FieldLabel from "@/components/FieldLabel";
import { FONT_FAMILY_CSS } from "@/components/FontFamilySelect";
import type { FontFamilyKey } from "@/lib/environmentSettings";

interface DiaryTitleFieldProps {
  value: string;
  onChange: (title: string) => void;
  /** 환경 설정("시간을 붙잡다" 전용) — 제목란은 폰트명·폰트 색상만 적용됩니다
   * (폰트크기·배경설정은 요구사항상 제목란에 적용하지 않음). 둘 다 생략하면
   * 이 필드가 쓰이는 다른 곳(있다면)엔 영향 없이 기본 스타일 그대로입니다. */
  fontFamily?: FontFamilyKey;
  fontColor?: string;
}

export default function DiaryTitleField({
  value,
  onChange,
  fontFamily,
  fontColor,
}: DiaryTitleFieldProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 sm:px-4">
      <FieldLabel>제목</FieldLabel>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="제목을 입력하세요"
        style={{
          fontFamily: fontFamily ? FONT_FAMILY_CSS[fontFamily] : undefined,
          color: fontColor,
        }}
        className="h-7 min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-xs text-[var(--text)] outline-none placeholder:text-[var(--placeholder)] focus:border-[var(--accent)] sm:h-8 sm:text-sm"
      />
    </div>
  );
}

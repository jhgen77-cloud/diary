interface FontSizeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

/** '폰트크기(Font Size)' 선택란. 네이티브 range 슬라이더에 앱의 액센트 컬러에 맞춘
 * accent-color만 입혀, 별도의 커스텀 트랙/섬 스타일링 없이도 나머지 UI와
 * 톤이 어울리게 했습니다. 현재 값을 px 단위 숫자로 옆에 함께 보여줍니다. */
export default function FontSizeSlider({
  value,
  onChange,
  min = 12,
  max = 32,
}: FontSizeSliderProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="폰트크기"
        className="h-1.5 w-32 cursor-pointer accent-[var(--accent)] sm:w-40"
      />
      <span className="w-12 shrink-0 text-xs text-[var(--text-sub)] sm:text-sm">
        {value}px
      </span>
    </div>
  );
}

import Image, { type StaticImageData } from "next/image";

interface IconOptionProps {
  icon: StaticImageData;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export default function IconOption({
  icon,
  label,
  selected,
  onSelect,
}: IconOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={label}
      aria-pressed={selected}
      className={`group relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 sm:h-6 sm:w-6 ${
        selected
          ? "bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]/40"
          : "hover:bg-[var(--hover)]"
      }`}
    >
      <span className="relative aspect-square h-full w-full p-1">
        <Image src={icon} alt={label} fill className="object-contain" />
      </span>
      {/* 이 툴팁은 아이콘 바로 위(날짜 필드 행)와 붙어 있어, 예전처럼
         -top-7(28px)만큼 띄우면 날짜 텍스트와 겹쳤습니다(실제로 지적받은
         문제) — top-0 + -translate-y-full로 아이콘 바로 위에 딱 붙게
         낮췄습니다(components/Tooltip.tsx와 같은 방식). */}
      <span className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-[0.65rem] whitespace-nowrap text-[var(--text)] opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

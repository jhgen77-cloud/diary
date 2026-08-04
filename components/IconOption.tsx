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
          ? "bg-black/[.08] ring-1 ring-black/30 dark:bg-white/[.12] dark:ring-white/40"
          : "hover:bg-black/[.06] dark:hover:bg-white/[.08]"
      }`}
    >
      <span className="relative aspect-square h-full w-full p-1">
        <Image src={icon} alt={label} fill className="object-contain" />
      </span>
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-1.5 py-0.5 text-[0.65rem] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/90 dark:text-black">
        {label}
      </span>
    </button>
  );
}

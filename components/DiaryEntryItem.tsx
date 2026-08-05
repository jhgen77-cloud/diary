import Image from "next/image";
import Link from "next/link";
import { formatDiaryDate, type DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_ICONS, WEATHER_ICONS, imageAttachmentIcon } from "@/lib/diaryIcons";

interface DiaryEntryItemProps {
  entry: DiaryEntry;
}

export default function DiaryEntryItem({ entry }: DiaryEntryItemProps) {
  const { year, month, day, weekday } = formatDiaryDate(entry.date);

  return (
    <li className="h-16 shrink-0 sm:h-20">
      <Link
        href={`/diary/${entry.id}`}
        className="group flex h-full items-center gap-4 rounded-2xl border border-black/[.06] bg-white/60 px-4 shadow-sm transition-colors hover:bg-black/[.03] dark:border-white/[.08] dark:bg-white/[.03] dark:hover:bg-white/[.06]"
      >
        <div className="flex w-12 shrink-0 flex-col items-center leading-tight text-black/70 sm:w-14 dark:text-zinc-300">
          <span className="text-[0.65rem] sm:text-xs">
            {year}.{String(month).padStart(2, "0")}
          </span>
          <span className="text-xl font-bold text-black sm:text-2xl dark:text-zinc-50">
            {day}
          </span>
          <span className="text-[0.65rem] sm:text-xs">{weekday}요일</span>
        </div>
        <span className="min-w-0 flex-1 truncate text-base font-medium text-black sm:text-lg dark:text-zinc-50">
          {entry.title}
        </span>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <span className="relative h-4 w-4 shrink-0 sm:h-5 sm:w-5">
            <Image
              src={MOOD_ICONS[entry.mood]}
              alt={entry.mood}
              fill
              className="object-contain"
            />
          </span>
          {entry.weather && (
            <span className="relative h-4 w-4 shrink-0 sm:h-5 sm:w-5">
              <Image
                src={WEATHER_ICONS[entry.weather]}
                alt={entry.weather}
                fill
                className="object-contain"
              />
            </span>
          )}
          {entry.hasAttachment && (
            <span className="relative h-4 w-4 shrink-0 sm:h-5 sm:w-5">
              <Image
                src={imageAttachmentIcon}
                alt="첨부"
                fill
                className="object-contain"
              />
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

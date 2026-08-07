import Image from "next/image";
import Link from "next/link";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import {
  MOOD_ICONS,
  WEATHER_ICONS,
  imageAttachmentIcon,
} from "@/lib/diaryIcons";

interface DiaryCalendarProps {
  entries: DiaryEntry[];
  year: number;
  month: number;
  selectedDay?: number | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

interface CalendarCell {
  day: number;
  entry?: DiaryEntry;
}

const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

const navButtonClass =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--text-sub)] transition-transform hover:bg-[var(--hover)] active:scale-90 active:bg-[var(--active)]";

function buildCalendarCells(entries: DiaryEntry[], year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const entryByDay = new Map<number, DiaryEntry>();
  entries.forEach((entry) => {
    const [entryYear, entryMonth, entryDay] = entry.date
      .split("-")
      .map(Number);
    if (entryYear === year && entryMonth === month + 1) {
      entryByDay.set(entryDay, entry);
    }
  });

  const cells: (CalendarCell | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, entry: entryByDay.get(day) });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

export default function DiaryCalendar({
  entries,
  year,
  month,
  selectedDay,
  onPrevMonth,
  onNextMonth,
}: DiaryCalendarProps) {
  const cells = buildCalendarCells(entries, year, month);
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between pb-2 sm:pb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="이전 달"
          className={navButtonClass}
        >
          ‹
        </button>
        <p className="text-sm font-medium text-[var(--text-sub)] sm:text-base">
          {year}년 {month + 1}월
        </p>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label="다음 달"
          className={navButtonClass}
        >
          ›
        </button>
      </div>
      <div className="grid shrink-0 grid-cols-7 gap-1 pb-1 text-center text-[0.65rem] text-[var(--text-sub)] sm:gap-2 sm:text-xs">
        {WEEKDAY_HEADERS.map((weekday, index) => (
          <span
            key={weekday}
            className={
              index === 0
                ? "text-red-500/70"
                : index === 6
                  ? "text-blue-500/70"
                  : undefined
            }
          >
            {weekday}
          </span>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-1 overflow-y-auto sm:gap-2">
        {cells.map((cell, index) => {
          if (!cell) return <div key={index} />;

          const { day, entry } = cell;
          const isToday = isCurrentMonth && day === today.getDate();
          const isSelected = selectedDay === day;

          const cellContent = (
            <div
              className={`flex h-full flex-col gap-0.5 rounded-xl border p-1 sm:p-1.5 ${
                isSelected
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent)]/40"
                  : isToday
                    ? "border-[var(--accent)]/50"
                    : "border-[var(--border)]"
              } ${entry ? "bg-[var(--card)]" : ""}`}
            >
              <span
                className={`text-xs font-semibold sm:text-sm ${
                  isToday || isSelected
                    ? "text-[var(--text)]"
                    : "text-[var(--text-sub)]"
                }`}
              >
                {day}
              </span>
              {entry && (
                <>
                  <div className="flex items-center gap-0.5">
                    <span className="relative h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5">
                      <Image
                        src={MOOD_ICONS[entry.mood]}
                        alt={entry.mood}
                        fill
                        className="object-contain"
                      />
                    </span>
                    {entry.weather && (
                      <span className="relative h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5">
                        <Image
                          src={WEATHER_ICONS[entry.weather]}
                          alt={entry.weather}
                          fill
                          className="object-contain"
                        />
                      </span>
                    )}
                    {entry.hasAttachment && (
                      <span className="relative h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5">
                        <Image
                          src={imageAttachmentIcon}
                          alt="첨부"
                          fill
                          className="object-contain"
                        />
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[0.6rem] leading-tight text-[var(--text-sub)] sm:text-[0.7rem]">
                    {entry.title}
                  </span>
                </>
              )}
            </div>
          );

          const href = entry
            ? `/diary/${entry.id}`
            : `/diary/date/${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

          return (
            <Link
              key={index}
              href={href}
              className="block h-full rounded-xl transition-transform active:scale-90"
            >
              {cellContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

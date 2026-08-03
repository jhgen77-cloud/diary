"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import filesIcon from "@/images/files.png";
import calendarIcon from "@/images/calendar.png";
import searchIcon from "@/images/search.png";

interface DiaryToolbarProps {
  initialQuery?: string;
}

const iconButtonClass =
  "flex shrink-0 items-center justify-center rounded-full p-1.5 transition-transform hover:bg-black/[.06] active:scale-90 active:bg-black/[.12] dark:hover:bg-white/[.08] dark:active:bg-white/[.14]";

export default function DiaryToolbar({
  initialQuery = "",
}: DiaryToolbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function handleSearch() {
    const trimmed = query.trim();
    router.push(trimmed ? `/diary?q=${encodeURIComponent(trimmed)}` : "/diary");
  }

  return (
    <div className="flex shrink-0 items-center gap-3 pb-4 sm:gap-4 sm:pb-6">
      <Link href="/diary" aria-label="파일 목록" className={iconButtonClass}>
        <span className="relative aspect-square h-6 shrink-0 sm:h-7">
          <Image src={filesIcon} alt="파일" fill className="object-contain" />
        </span>
      </Link>
      <Link
        href="/diary/calendar"
        aria-label="달력 검색"
        className={iconButtonClass}
      >
        <span className="relative aspect-square h-6 shrink-0 sm:h-7">
          <Image
            src={calendarIcon}
            alt="달력"
            fill
            className="object-contain"
          />
        </span>
      </Link>
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="검색"
        className="h-8 min-w-0 flex-1 rounded-full border border-black/10 bg-white/60 px-4 text-sm text-black outline-none placeholder:text-black/40 focus:border-black/30 sm:h-9 sm:text-base dark:border-white/15 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/30"
      />
      <button
        type="button"
        onClick={handleSearch}
        aria-label="검색"
        className={iconButtonClass}
      >
        <span className="relative aspect-square h-6 shrink-0 sm:h-7">
          <Image src={searchIcon} alt="검색" fill className="object-contain" />
        </span>
      </button>
    </div>
  );
}

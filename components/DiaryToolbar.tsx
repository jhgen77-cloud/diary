"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import filesIcon from "@/images/files.png";
import calendarIcon from "@/images/calendar.png";
import searchIcon from "@/images/search.png";
import Tooltip from "@/components/Tooltip";

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
    <div className="mt-2 flex shrink-0 items-center gap-1.5 pb-2 sm:mt-3 sm:gap-2 sm:pb-3">
      {/* 파일/달력 두 아이콘 사이 간격을 최대한 좁혀(0) 서로 붙여 배치합니다.
         각자 원형 hover 배경(rounded-full)이 있어 붙어 있어도 두 버튼으로
         구분됩니다. 뒤이어 붙는 검색란+검색 아이콘도 이 그룹의 오른쪽 끝을
         기준으로 이어지므로 함께 파일 아이콘 쪽으로 당겨집니다. */}
      <div className="flex shrink-0 items-center gap-0">
        {/* 이 둘은 모달 왼쪽 가장자리에 붙어 있어, 기본(align="end") 정렬로는
           말풍선이 왼쪽으로 넘쳐 모달 밖까지 벗어납니다. align="start"로 오른쪽
           (모달 안쪽 여유 공간) 방향으로 펼치게 합니다. */}
        <Link href="/diary" aria-label="파일 목록" className={iconButtonClass}>
          <Tooltip label="리스트 형식으로 보기" align="start">
            {/* Tooltip 안에 감싸이며 더 이상 Link의 직속 flex 자식이 아니게 돼(flex
               자식은 display가 자동으로 block으로 바뀌지만, 여기선 아님), span
               기본값인 inline이 그대로 남아 aspect-square/h-6이 무시되고 있었습니다
               — 아이콘이 0×0으로 찌부러져 안 보이던 원인. block을 명시해 고쳤습니다. */}
            <span className="relative block aspect-square h-7 shrink-0 sm:h-8">
              <Image src={filesIcon} alt="파일" fill className="object-contain" />
            </span>
          </Tooltip>
        </Link>
        <Link
          href="/diary/calendar"
          aria-label="달력 검색"
          className={iconButtonClass}
        >
          <Tooltip label="달력 형식으로 보기" align="start">
            <span className="relative block aspect-square h-7 shrink-0 sm:h-8">
              <Image
                src={calendarIcon}
                alt="달력"
                fill
                className="object-contain"
              />
            </span>
          </Tooltip>
        </Link>
      </div>
      {/* 검색란과 검색 아이콘도 좁은 간격(gap-1)으로 묶어, 검색 아이콘이 검색란
         쪽으로 붙어 보이게 합니다. */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색"
          className="h-8 min-w-0 max-w-[14rem] flex-1 rounded-full border border-black/10 bg-white/60 px-4 text-sm text-black outline-none placeholder:text-black/40 focus:border-black/30 sm:h-9 sm:max-w-[18rem] sm:text-base dark:border-white/15 dark:bg-white/[.04] dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-white/30"
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
    </div>
  );
}

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";

interface DiaryMenuItemProps {
  href: string;
  title: string;
  image: StaticImageData;
  imageAlt: string;
}

export default function DiaryMenuItem({
  href,
  title,
  image,
  imageAlt,
}: DiaryMenuItemProps) {
  return (
    <li className="min-h-0 flex-1">
      <Link
        href={href}
        className="group flex h-full items-center gap-4 rounded-2xl border border-black/[.06] bg-white/60 p-2 shadow-sm transition-colors hover:bg-black/[.03] sm:gap-6 sm:p-3 dark:border-white/[.08] dark:bg-white/[.03] dark:hover:bg-white/[.06]"
      >
        <div className="relative aspect-[3/2] h-full shrink-0 overflow-hidden rounded-xl">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 640px) 33vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* 툴팁 위치가 텍스트 자체를 기준으로 잡히도록, 카드 전체가 아니라 제목
           텍스트만 Tooltip으로 감쌉니다(Header의 "기억" 툴팁과 같은 방식). */}
        <Tooltip label={imageAlt}>
          <span className="text-base leading-snug font-medium text-black sm:text-xl md:text-2xl dark:text-zinc-50">
            {title}
          </span>
        </Tooltip>
      </Link>
    </li>
  );
}

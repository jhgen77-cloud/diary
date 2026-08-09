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
        className="group flex h-full items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 transition-colors hover:bg-[var(--hover)] sm:gap-6 sm:p-3"
      >
        {/* 좁은 화면에서는 이미지가 aspect-[3/2] h-full로 카드 폭을 많이 차지해,
           "기억의 유실을 회복하다"처럼 긴 제목이 단어 중간("회복하다"의 "회"와
           "복하다" 사이)에서 잘려 두 줄이 아니라 세 줄로 어색하게 쪼개졌습니다
           (실제로 겪은 문제) — 모바일 기준에서만 이미지를 살짝 더 좁은
           비율(aspect-[5/4])로 줄여 텍스트 쪽에 폭을 더 줘서 "기억의 유실을"
           까지는 한 줄에, "회복하다"는 다음 줄에 온전히 들어오게 합니다.
           sm 이상(PC 등 카드가 넉넉히 큰 화면)은 기존 비율 그대로 둡니다. */}
        <div className="relative aspect-[5/4] h-full shrink-0 overflow-hidden rounded-xl sm:aspect-[3/2]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 640px) 33vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* 툴팁 위치가 텍스트 자체를 기준으로 잡히도록, 카드 전체가 아니라 제목
           텍스트만 Tooltip으로 감쌉니다(Header의 "기억" 툴팁과 같은 방식).
           text-sm(기존 text-base보다 한 단계 작게)도 같은 이유로 살짝
           줄였습니다. break-keep(word-break: keep-all)이 핵심 — 한글은
           기본적으로 공백이 없어도 아무 글자 사이에서나 줄바꿈이 허용되는데,
           이걸 막아서 반드시 띄어쓰기(공백) 위치에서만 줄이 바뀌게 합니다.
           "회복하다"처럼 한 단어가 중간에서 잘리는 일이 없어집니다. */}
        <Tooltip label={imageAlt}>
          <span className="text-sm leading-snug font-medium break-keep text-[var(--text)] sm:text-xl md:text-2xl">
            {title}
          </span>
        </Tooltip>
      </Link>
    </li>
  );
}

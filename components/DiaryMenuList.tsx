import type { StaticImageData } from "next/image";
import DiaryMenuItem from "@/components/DiaryMenuItem";

export interface DiaryMenuListItem {
  href: string;
  title: string;
  image: StaticImageData;
  imageAlt: string;
}

interface DiaryMenuListProps {
  items: DiaryMenuListItem[];
}

export default function DiaryMenuList({ items }: DiaryMenuListProps) {
  return (
    <ul className="flex h-full w-full max-w-3xl flex-col gap-3 sm:gap-4">
      {items.map((item) => (
        <DiaryMenuItem key={item.href} {...item} />
      ))}
    </ul>
  );
}

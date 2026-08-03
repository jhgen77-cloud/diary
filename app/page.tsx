import Header from "@/components/Header";
import SettingsButton from "@/components/SettingsButton";
import DiaryMenuList, {
  type DiaryMenuListItem,
} from "@/components/DiaryMenuList";
import readingImage from "@/images/list-reading.jpg";
import writingImage from "@/images/list-writing.jpg";
import dataMgtImage from "@/images/list-datamgt.png";

const menuItems: DiaryMenuListItem[] = [
  {
    href: "/diary",
    title: "그날을 거닐다",
    image: readingImage,
    imageAlt: "일기보기",
  },
  {
    href: "/diary/write",
    title: "시간을 붙잡다",
    image: writingImage,
    imageAlt: "일기쓰기",
  },
  {
    href: "/data",
    title: "기억의 유실을 회복하다",
    image: dataMgtImage,
    imageAlt: "데이터관리",
  },
];

export default function Home() {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-zinc-100 p-4 dark:bg-zinc-950 sm:p-6">
      <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border border-black/10 bg-zinc-50 p-4 shadow-sm sm:p-6 dark:border-white/15 dark:bg-black">
        <SettingsButton />
        <Header />
        <div className="mx-auto my-2 h-px w-full max-w-sm shrink-0 bg-black/10 sm:my-3 dark:bg-white/15" />
        <main className="flex min-h-0 w-full flex-1 justify-center">
          <DiaryMenuList items={menuItems} />
        </main>
      </div>
    </div>
  );
}

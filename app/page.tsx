import Header from "@/components/Header";
import SettingsButton from "@/components/SettingsButton";
import InfoButton from "@/components/InfoButton";
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
    <div className="flex h-dvh justify-center overflow-hidden bg-[var(--background)] p-4 sm:p-6">
      <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        {/* settings.png 오른쪽에 info.png가 나란히 오도록(요구사항) 두 아이콘을
           한 그룹으로 묶어 우측 상단에 배치합니다. */}
        <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
          <SettingsButton />
          <InfoButton />
        </div>
        <Header />
        <div className="mx-auto my-2 h-px w-full max-w-sm shrink-0 bg-[var(--border)] sm:my-3" />
        <main className="flex min-h-0 w-full flex-1 justify-center">
          <DiaryMenuList items={menuItems} />
        </main>
      </div>
    </div>
  );
}

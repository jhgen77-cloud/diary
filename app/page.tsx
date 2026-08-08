import { cookies } from "next/headers";
import Header from "@/components/Header";
import SettingsButton from "@/components/SettingsButton";
import InfoButton from "@/components/InfoButton";
import LogoutButton from "@/components/LogoutButton";
import DiaryMenuList, {
  type DiaryMenuListItem,
} from "@/components/DiaryMenuList";
import { createClient } from "@/utils/supabase/server";
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

export default async function Home() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[var(--background)] p-4 sm:p-6">
      <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
        <div className="absolute top-4 right-4 flex items-center gap-2 sm:top-6 sm:right-6">
          <SettingsButton />
          <InfoButton />
        </div>
        <Header />
        <div className="mx-auto my-2 h-px w-full max-w-sm shrink-0 bg-[var(--border)] sm:my-3" />
        <main className="flex min-h-0 w-full flex-1 justify-center">
          <DiaryMenuList items={menuItems} />
        </main>
        {/* absolute로 우측 하단에 얹으면 메뉴 목록(flex-1이라 카드 하단까지
           꽉 채움)의 세 번째 항목과 겹쳤습니다 — 일반 흐름에 넣어서 main의
           flex-1이 이 버튼 높이만큼 자동으로 줄어들게 합니다. */}
        {user && (
          <div className="mt-3 flex w-full shrink-0 justify-end sm:mt-4">
            <LogoutButton />
          </div>
        )}
      </div>
    </div>
  );
}

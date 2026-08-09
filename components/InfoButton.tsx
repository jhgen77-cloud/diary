import Image from "next/image";
import Link from "next/link";
import infoIcon from "@/images/info.png";
import Tooltip from "@/components/Tooltip";

/** 메인 페이지 우측 상단 아이콘 중 하나 — settings.png(SettingsButton) 오른쪽에
 * 나란히 놓입니다(둘을 함께 배치하는 실제 위치 지정은 app/page.tsx가 담당). */
export default function InfoButton() {
  return (
    <Tooltip label="정보" tapToReveal>
      <Link
        href="/info"
        aria-label="정보"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 sm:h-10 sm:w-10"
      >
        <Image src={infoIcon} alt="정보" className="h-full w-full object-contain" />
      </Link>
    </Tooltip>
  );
}

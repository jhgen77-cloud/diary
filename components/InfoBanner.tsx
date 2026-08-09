import Image from "next/image";
import deskPhoto from "@/images/startupstockphotos-desk.jpg";

/** 정보 모달의 사이드바 옆(본문 칸) 위쪽, "기억" 글자 옆에 나란히 배치하는
 * 작은 대표 이미지(요구사항). 원본 비율(3:2)에 가깝게 가로/세로 모두 작은
 * 고정 크기로 줄였습니다. 순수 장식용이라 alt는 빈 문자열로 둬 스크린리더가
 * 읽지 않고 건너뛰게 합니다. */
export default function InfoBanner() {
  return (
    <div className="relative h-36 w-52 shrink-0 overflow-hidden rounded-xl sm:h-48 sm:w-72">
      <Image src={deskPhoto} alt="" fill priority className="object-cover" />
    </div>
  );
}

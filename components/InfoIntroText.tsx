/** 정보 모달의 소개 문구(시적인 세 줄). 이전엔 InfoContent 안에 인라인으로
 * 있었지만, 문구 자체가 자주 교체 대상이라 InfoContent(버전 표시 + 레이아웃)와
 * 분리해 이 컴포넌트로 뗐습니다 — 문구만 고칠 땐 이 파일만 보면 됩니다.
 *
 * "중앙 가운데에 배치할 것" 요구사항 때문에, 버전 줄(ml-4/6로 왼쪽 정렬)과
 * 달리 이 컴포넌트는 InfoContent에서 ml 없는 전체 폭 자리에 렌더링되고,
 * w-full + text-center로 본문 영역(사이드바 옆 칸) 가로 폭 안에서
 * 가운데 정렬됩니다. "기존 위치에서 좀 더 아래로 배치할 것" 요구사항은
 * mt-6/sm:mt-10(문서 흐름 여백)으로 반영했습니다 — 가운데 정렬과 함께
 * 쓰이므로 transform 대신 margin을 씁니다.
 *
 * "좌측으로 좀 더 이동해주세요" 요구사항은 -translate-x로 반영했습니다 —
 * text-center 정렬 기준(가운데)은 그대로 두고, 블록 전체만 왼쪽으로 살짝
 * 옮겨서 완전한 좌측 정렬이 아니라 중앙에서 조금 치우친 위치가 되게
 * 했습니다.
 *
 * "좀 내려주세요" 요구사항은 mt-6/sm:mt-10을 mt-10/sm:mt-16으로 늘려
 * 반영했습니다.
 *
 * "폰트를 좀 더 키워주세요" 요구사항은 text-sm/sm:text-base를
 * text-base/sm:text-lg로 한 단계씩 올려 반영했습니다. */
export default function InfoIntroText() {
  return (
    <div className="mt-10 w-full -translate-x-6 text-center sm:mt-16 sm:-translate-x-10">
      <p className="text-base break-keep text-[var(--text-sub)] sm:text-lg">
        지나온 삶의 모든 순간을,
      </p>
      <p className="mt-2 text-base break-keep text-[var(--text-sub)] sm:text-lg">
        아름다운 한 편의 시로 기록하도록,
      </p>
      <p className="mt-2 text-base break-keep text-[var(--text-sub)] sm:text-lg">
        &apos;기억&apos;은 언제나 활짝 열려 있는 무료 일기장입니다.
      </p>
    </div>
  );
}

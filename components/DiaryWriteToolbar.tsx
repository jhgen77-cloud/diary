"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Tooltip from "@/components/Tooltip";
import {
  toolbarSaveIcon,
  toolbarSaveSavedIcon,
  toolbarCalendarIcon,
  toolbarWasteBasketIcon,
  toolbarImageAttachmentIcon,
  toolbarImageAttachmentSavedIcon,
  toolbarSecuritySaveIcon,
} from "@/lib/diaryIcons";

interface DiaryWriteToolbarProps {
  onSave: () => void;
  onDelete: () => void;
  onOpenAttach: () => void;
  saved: boolean;
  hasAttachment: boolean;
  /** 수정 화면에서 원본 글(또는 중복 날짜 검사에 쓰는 전체 목록)을 아직 다
   * 불러오지 못한 동안 true — 이때 저장하면 entryId/date가 아직 새 글
   * 기본값이라 수정이 아니라 새 글로 저장되며, 원본과 같은 날짜에 중복
   * 저장되는 문제가 있었습니다(실제로 겪은 문제). 그 동안은 저장 버튼을
   * 눌러도 반응하지 않게 막습니다. */
  saveDisabled?: boolean;
  /** 이번 저장에 이 글을 암호화할지(글마다 따로 고름 — 전체 일괄 적용 아님). */
  encryptOnSave: boolean;
  onToggleEncrypt: () => void;
}

// 아이콘 밑 글자 라벨을 없앤 대신(요구사항), 그 자리만큼 아이콘 자체를 키우고
// Tooltip으로 이름을 보여줍니다. 라벨이 안 보여도 스크린리더 등 접근성은
// 유지되도록 각 버튼에 aria-label도 함께 둡니다.
const actionButtonClass =
  "flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-[var(--hover)] active:scale-95";

// lib/diaryIcons.ts의 toolbar* 아이콘들은 그림 영역만 남기고 균일한 비율의
// 여백으로 다시 잘라낸 전용 파일이라(원본은 캔버스 안 여백이 제각각이었음),
// width를 강제로 정사각형에 맞추지 않고 height만 고정 + width는 auto로 두면
// (아래 className) 모든 아이콘이 같은 시각적 크기 및 같은 상하 여백 비율로
// 렌더링되어, 굳이 아이콘마다 다른 배율을 주지 않아도 바닥(및 크기)이
// 자연스럽게 맞습니다. translate-y로는 전부 살짝 아래로 내렸습니다(요구사항).
const iconImageClass = "h-7 w-auto translate-y-1 sm:h-8";
// ColorableIcon(아래)이 마스크로 색을 입힐 때 쓰는 크기 — save/security-save
// 아이콘은 둘 다 1:1 정사각형으로 다시 잘라뒀으므로(images/toolbar 생성 시
// 확인) 너비를 auto 대신 명시해도 비율이 깨지지 않습니다.
const iconMaskClass = "h-7 w-7 translate-y-1 sm:h-8 sm:w-8";

// 저장 아이콘이 "저장됨" 표시로 쓰는 파란색과 정확히 같은 색(images/save-saved.png
// 픽셀에서 직접 추출: rgb(37,99,235)) — 암호화를 켰을 때도 같은 파란색을 써서
// "저장하면 안전하게 반영됨"이라는 기존 색 언어를 그대로 이어갑니다.
const ENCRYPT_BLUE = "#2563eb";
// 암호화 아이콘 자체는 앱에 이미 있는 경고색 토큰(--error)을 그대로 씁니다.
const ENCRYPT_RED = "var(--error)";

interface ColorableIconProps {
  icon: StaticImageData;
  alt: string;
  /** 지정하면 아이콘을 이 색의 단색 실루엣으로 보여줍니다(CSS mask-image —
   * PNG의 알파 채널만 스텐실로 쓰고 배경색을 그 색으로 채우는 방식이라,
   * 원본이 어떤 색이든 정확한 목표 색으로 바꿀 수 있습니다). 지정하지 않으면
   * 원본 그대로(검정 선화) 보여줍니다. */
  tint?: string;
  /** tint가 있을 때만 의미가 있는 진하기(0~1, 기본 1) — "예고"(아직 저장 전)와
   * "확정"(저장 완료) 상태를 색 하나로만 뭉뚱그리지 않고 옅음/진함으로
   * 구분하는 데 씁니다(저장 아이콘 참고). */
  tintOpacity?: number;
}

function ColorableIcon({ icon, alt, tint, tintOpacity = 1 }: ColorableIconProps) {
  if (!tint) {
    return <Image src={icon} alt={alt} className={iconImageClass} />;
  }
  return (
    <span
      role="img"
      aria-label={alt}
      className={`${iconMaskClass} inline-block bg-current`}
      style={{
        color: tint,
        opacity: tintOpacity,
        WebkitMaskImage: `url(${icon.src})`,
        maskImage: `url(${icon.src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export default function DiaryWriteToolbar({
  onSave,
  onDelete,
  onOpenAttach,
  saved,
  hasAttachment,
  saveDisabled = false,
  encryptOnSave,
  onToggleEncrypt,
}: DiaryWriteToolbarProps) {
  return (
    // 저장 아이콘은 그대로 두고(요구사항), 나머지 아이콘들만 저장 쪽으로
    // 살짝 붙도록 아이콘 사이 간격만 줄였습니다 — 저장이 맨 앞(flex 시작)
    // 요소라 gap을 줄여도 저장 자체의 위치는 그대로고, 뒤따르는 아이콘들만
    // 왼쪽으로 당겨집니다.
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
      {/* 툴바가 모달 왼쪽 가장자리에 가까워, 기본값(오른쪽 정렬)이면 첫
         아이콘의 툴팁이 모달 밖 왼쪽으로 넘칠 수 있어 align="start"를
         씁니다(ImageAttachModal의 도구 아이콘과 같은 이유). tapToReveal:
         라벨 텍스트가 없어 툴팁이 유일한 설명 수단이라, 호버가 없는
         터치 기기에서는 첫 탭에 툴팁만 뜨고 그다음 탭에 실제 동작이
         일어나게 합니다. */}
      <Tooltip label="저장" align="start" tapToReveal>
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled}
          aria-label="저장"
          className={`${actionButtonClass} ${saveDisabled ? "pointer-events-none opacity-40" : ""}`}
        >
          {/* 암호화를 켜면(요구사항) 저장 아이콘도 함께 파란색으로 바뀌어
             "이 글은 암호화되어 저장된다"는 걸 바로 보여주되, 저장 전/후를
             구분할 수 있어야 합니다 — 전에는 두 상태(저장 전 vs 저장됨)가
             아이콘 모양(테두리만 vs 안쪽 칸까지 채움)으로 구분됐는데, 항상
             똑같은 진한 파란색으로 덮어버리는 바람에 그 구분이 없어져
             "저장을 눌러도 아무 변화가 없다 = 안 됐나보다"로 오해하게
             만든 실제 버그가 있었습니다. 저장 전엔 옅게(예고), 저장 완료
             시엔 진하게(확정) 칠해서 다시 구분되게 합니다. */}
          <ColorableIcon
            icon={saved ? toolbarSaveSavedIcon : toolbarSaveIcon}
            alt="저장"
            tint={encryptOnSave ? ENCRYPT_BLUE : undefined}
            tintOpacity={encryptOnSave && !saved ? 0.45 : 1}
          />
        </button>
      </Tooltip>
      {/* 실제로 암호화되려면 "일기 암호"가 이번 세션에 unlock돼 있어야
         하는데, 그 확인/안내는 저장 시점에 DiaryWriteForm이 담당합니다 —
         이 버튼은 "이 글을 암호화하고 싶다"는 의사만 토글합니다. */}
      <Tooltip label="암호화" align="start" tapToReveal>
        <button
          type="button"
          onClick={onToggleEncrypt}
          aria-label="암호화"
          aria-pressed={encryptOnSave}
          className={`${actionButtonClass} ${
            encryptOnSave ? "bg-[var(--error)]/10 ring-1 ring-[var(--error)]/40" : ""
          }`}
        >
          <ColorableIcon
            icon={toolbarSecuritySaveIcon}
            alt="암호화"
            tint={encryptOnSave ? ENCRYPT_RED : undefined}
          />
        </button>
      </Tooltip>
      <Tooltip label="달력" align="start" tapToReveal>
        <Link href="/diary/calendar" aria-label="달력" className={actionButtonClass}>
          <Image src={toolbarCalendarIcon} alt="달력" className={iconImageClass} />
        </Link>
      </Tooltip>
      <Tooltip label="사진 첨부" align="start" tapToReveal>
        <button
          type="button"
          onClick={onOpenAttach}
          aria-label="첨부"
          className={actionButtonClass}
        >
          <Image
            src={hasAttachment ? toolbarImageAttachmentSavedIcon : toolbarImageAttachmentIcon}
            alt="사진 첨부"
            className={iconImageClass}
          />
        </button>
      </Tooltip>
      <Tooltip label="삭제" align="start" tapToReveal>
        <button type="button" onClick={onDelete} aria-label="삭제" className={actionButtonClass}>
          <Image src={toolbarWasteBasketIcon} alt="삭제" className={iconImageClass} />
        </button>
      </Tooltip>
    </div>
  );
}

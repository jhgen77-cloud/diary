"use client";

import { useState } from "react";
import DataCheckboxOption from "@/components/DataCheckboxOption";
import NoticeDialog from "@/components/NoticeDialog";
import Tooltip from "@/components/Tooltip";
import { letterIIcon, questionMarkIcon } from "@/lib/diaryIcons";
import { clearSavedDiaryEntries, useSavedDiaryEntries } from "@/lib/savedDiaryEntries";

type DialogState = "none" | "confirm" | "done" | "empty";

/** 기억의 소멸 — 데이터가 저장되는 곳('기억의 은하')을 보여주고, 그 데이터를 모두
 * 초기화(소멸)합니다. '모든 데이터를 삭제합니다.' 체크박스에 동의해야만 [소멸]
 * 버튼이 활성화됩니다. */
export default function DataResetPanel() {
  const entries = useSavedDiaryEntries();
  const [agreed, setAgreed] = useState(false);
  const [dialog, setDialog] = useState<DialogState>("none");

  function handleConfirmReset() {
    clearSavedDiaryEntries();
    setAgreed(false);
    setDialog("done");
  }

  // 삭제할 데이터가 없으면 확인 절차 없이 바로 '데이터 없음' 알림만 띄웁니다.
  function handleResetClick() {
    setDialog(entries.length === 0 ? "empty" : "confirm");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/* 기억의 은하 — 데이터가 실제로 저장되는 곳. 아직 데이터베이스가 없어,
         지금은 브라우저 로컬 저장소를 임시로 쓰고 있음을 경로 자리에 표기합니다.
         테두리 박스는 '기억의 은하' 텍스트에만 한정합니다. */}
      {/* 이 패널을 감싸는 DataManager의 스크롤 영역(overflow-y-auto)이 그 경계
         위로 넘치는 내용을 그대로 잘라냅니다. '기억의 은하' 툴팁이 그 경계 맨
         위쪽 요소 바로 위(-top-2만큼 띄우고 자기 높이만큼 위로, 총 32px)에
         뜨는데, 그 앞에 여유 공간이 없으면 툴팁이 스크롤 영역 위로 잘려 나가
         보이지 않고(그 자리에 있던 DataTabNav의 '기억의 귀환' 탭 버튼이 대신
         비쳐 보임) — 실제로 재현해 확인한 문제입니다. paddingTop을 style로 직접
         주는 이유: Tailwind 클래스(예: pt-9)로는 이 프로젝트의 개발 서버가 그
         값을 CSS로 새로 생성해 반영하지 않는 문제가 있어(기존에 pt-1~4만
         쓰여서 컴파일돼 있었고, 처음 쓰는 값은 핫리로드에 반영되지 않음을
         확인함), 빌드 결과에 의존하지 않는 인라인 스타일로 확실히 적용합니다. */}
      <div className="flex flex-wrap items-center gap-2" style={{ paddingTop: "2.25rem" }}>
        {/* 사이드바 바로 옆, 모달 왼쪽 가장자리에 가까워 align="start"로 오른쪽
           (여유 공간) 방향으로 펼치게 해 모달 밖으로 벗어나지 않게 합니다. */}
        <Tooltip label="DB경로" align="start" focusable>
          <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:px-5 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300">
            기억의 은하
          </span>
        </Tooltip>
        <span className="truncate text-xs text-black/60 sm:text-sm dark:text-zinc-400">
          (데이터베이스 미구현) 브라우저 로컬 저장소 · diary:savedEntries
        </span>
      </div>

      {/* 기억의 소멸 — 체크박스로 삭제 의사를 확인받은 뒤에만 [소멸] 버튼이
         활성화됩니다. 테두리 박스는 '기억의 소멸' 텍스트에만 한정합니다. */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* 이 텍스트도 사이드바와 같은 왼쪽 열에 있어 align="start"를 씁니다. */}
            <Tooltip label="데이터초기화" align="start" focusable>
              <span className="shrink-0 rounded-lg border border-black/10 px-4 py-1 text-center text-xs font-medium whitespace-nowrap text-black/70 sm:px-5 sm:py-1.5 sm:text-sm dark:border-white/15 dark:text-zinc-300">
                기억의 소멸
              </span>
            </Tooltip>
            <DataCheckboxOption
              label="모든 데이터를 삭제합니다."
              checked={agreed}
              onChange={() => setAgreed((prev) => !prev)}
            />
          </div>
          <Tooltip label="초기화">
            <button
              type="button"
              onClick={handleResetClick}
              disabled={!agreed}
              className="shrink-0 rounded-full border border-black/10 px-4 py-1.5 text-xs text-black/70 transition-colors hover:bg-black/[.06] disabled:pointer-events-none disabled:opacity-40 sm:text-sm dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/[.08]"
            >
              소멸
            </button>
          </Tooltip>
        </div>
      </div>

      {dialog === "confirm" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message={`저장된 일기 ${entries.length}개를 모두 삭제합니다.\n계속 진행하시겠습니까?`}
          confirmLabel="예"
          onConfirm={handleConfirmReset}
          cancelLabel="아니요"
          onCancel={() => setDialog("none")}
          confirmFirst
          wide
        />
      )}
      {dialog === "done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="데이터베이스 초기화가 완료되었습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
      {dialog === "empty" && (
        <NoticeDialog
          icon={letterIIcon}
          message="초기화 할 데이터가 없습니다."
          onConfirm={() => setDialog("none")}
          wide
        />
      )}
    </div>
  );
}

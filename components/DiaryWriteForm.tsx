"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/Modal";
import DiaryWriteToolbar from "@/components/DiaryWriteToolbar";
import DiaryDateField from "@/components/DiaryDateField";
import DiaryMoodField from "@/components/DiaryMoodField";
import DiaryWeatherField from "@/components/DiaryWeatherField";
import DiaryTitleField from "@/components/DiaryTitleField";
import DiaryContentField from "@/components/DiaryContentField";
import ImageAttachModal from "@/components/ImageAttachModal";
import NoticeDialog from "@/components/NoticeDialog";
import {
  warningSignIcon,
  questionMarkIcon,
  letterIIcon,
  type MoodKey,
  type WeatherKey,
} from "@/lib/diaryIcons";
import {
  MAX_IMAGES,
  MAX_ZOOM,
  MIN_ZOOM,
  isSameImageFile,
  fileToStoredImage,
  storedImageToFile,
  type AttachedImage,
} from "@/lib/imageAttachment";
import { formatLocalDate, isDiaryEntryEditable, type DiaryEntry } from "@/lib/mockDiaryEntries";
import {
  addSavedDiaryEntry,
  updateSavedDiaryEntryId,
  useSavedDiaryEntry,
  useSavedDiaryEntries,
} from "@/lib/savedDiaryEntries";
import { useEnvironmentSettings } from "@/lib/environmentSettings";
import {
  insertMemoryEntry,
  updateMemoryEntry,
  deleteDiaryEntryEverywhere,
  useRemoteMemoryEntry,
  useMemoryEntries,
  isRemoteEntryId,
  getSyncedRemoteId,
  confirmSyncedRemoteId,
} from "@/lib/memoryEntries";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

function createDefaults() {
  return {
    date: new Date(),
    mood: "none" as MoodKey,
    weather: null as WeatherKey | null,
    title: "",
    content: "",
  };
}

type DialogState =
  | { type: "none" }
  | { type: "empty-content" }
  | { type: "duplicate-date" }
  | { type: "delete-confirm" }
  | { type: "delete-done" }
  | { type: "close-confirm" };

export default function DiaryWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const localExistingEntry = useSavedDiaryEntry(editId);
  // 로컬(이 탭에서 저장한 글)에 없으면 Supabase에서 읽어온 글일 수 있어
  // 그쪽도 확인합니다.
  const { entry: remoteExistingEntry, loading: remoteEntryLoading } = useRemoteMemoryEntry(
    localExistingEntry ? null : editId
  );
  const existingEntry = localExistingEntry ?? remoteExistingEntry;
  // 환경 설정(SettingsManager)에서 고른 값 — "시간을 붙잡다"에서만 실제로
  // 적용됩니다(요구사항). 제목란은 폰트명/폰트 색상만, 본문란은 다섯 항목 모두.
  const envSettings = useEnvironmentSettings();

  // 하루에 일기는 하나만 쓸 수 있습니다 — 저장 시 이 목록(로컬 저장 글 +
  // Supabase에 이미 있는 글)에서 같은 날짜를 가진 다른 글이 있는지 확인합니다
  // (달력은 날짜당 글 하나만 있다고 가정하고 그리므로, 이 검사가 없으면
  // 같은 날짜에 여러 글이 저장돼 달력에 하나만 보이는 문제가 다시 생깁니다).
  const allSavedEntries = useSavedDiaryEntries();
  const { entries: allRemoteEntries, loading: allRemoteEntriesLoading } =
    useMemoryEntries(allSavedEntries);
  const allEntries = [...allSavedEntries, ...allRemoteEntries];

  // 수정 화면(editId 있음)인데 원본 글을 아직 로컬/원격 어느 쪽에서도 찾지
  // 못한 동안(remoteEntryLoading) — 이때 entryId는 아직 새 글용 임시 uuid라
  // 저장하면 수정이 아니라 새 글로 추가되어, 원본과 같은 날짜에 중복
  // 저장되는 문제가 있었습니다(실제로 겪은 문제: 이미 작성된 글을 수정 버튼
  // 으로 열어 빠르게 저장하면 같은 날짜의 글이 하나 더 생김). 전체 목록(중복
  // 날짜 검사용)이 아직 로딩 중일 때도 같은 이유로 저장을 미룹니다.
  const isEditEntryLoading = !!editId && !existingEntry && remoteEntryLoading;
  // 작성 당일이 지난 글은 더 이상 고칠 수 없습니다(정책) — 저장 버튼도 함께 막습니다.
  const isEditLocked = !!existingEntry && !isDiaryEntryEditable(existingEntry);

  // "아무 것도 안 한 상태"를 판단하는 기준 스냅샷. 새 글이면 빈 값, 기존 글을
  // 수정하러 들어왔다면(editId) 그 글을 불러온 뒤 이 값도 함께 갱신됩니다.
  const [baseline, setBaseline] = useState(() => createDefaults());
  const [date, setDate] = useState(baseline.date);
  const [mood, setMood] = useState<MoodKey>(baseline.mood);
  const [weather, setWeather] = useState<WeatherKey | null>(baseline.weather);
  const [title, setTitle] = useState(baseline.title);
  const [content, setContent] = useState(baseline.content);
  const [saved, setSaved] = useState(false);
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>({ type: "none" });
  // 이 작성 세션이 목록에 저장될 때 쓸 고유 id — 같은 세션에서 다시 저장하면
  // 새 항목이 아니라 같은 항목을 덮어씁니다. 기존 글을 수정하는 경우엔 그
  // 글의 id로 교체됩니다.
  const [entryId, setEntryId] = useState(() => crypto.randomUUID());
  // 최초 저장 시각(작성 시각). 기존 글을 불러오면 원래 작성 시각을 유지합니다.
  const createdAtRef = useRef<string | null>(null);
  // 이미 불러와 반영한 editId. boolean이 아니라 editId 값 자체를 저장해두는
  // 이유 — 이 컴포넌트 인스턴스가 재사용된 채 검색 파라미터(editId)만 바뀌는
  // 경우(예: 글쓰기 화면을 나가지 않고 다른 글의 수정 화면으로 바로 이동)에도
  // "이전 글을 이미 불러왔다"는 상태에 막혀 새 editId를 못 불러오는 일이
  // 없도록, editId가 바뀌면 다시 불러오게 합니다.
  const hasLoadedEditRef = useRef<string | null>(null);

  // 첨부 이미지 상태는 "시간을 붙잡다" 모달(이 컴포넌트)이 살아있는 동안 유지됩니다.
  // 이미지 첨부 모달은 열고 닫아도 이 상태를 그대로 두므로 첨부 내용이 사라지지 않습니다.
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const nextImageId = useRef(0);
  const attachedImagesRef = useRef<AttachedImage[]>([]);
  // 기존 글을 고치는 중 첨부 이미지를 직접 추가/삭제했는지. attachImageFiles /
  // handleRemoveSelectedImage에서만 true로 바뀌고, 글을 새로 불러올 때(수정
  // 화면 진입, 초기화)마다 false로 되돌립니다 — buildEntryFromState가 이 값으로
  // "이미지를 실제로 건드렸는지"를 판단합니다.
  const imagesTouchedRef = useRef(false);
  // 이 editId의 첨부 이미지 복원을 이미 끝냈는지("복원 완료" 표시 — 성공적으로
  // 끝난 뒤에만 채워집니다. 아래 이미지 복원 useEffect 참고). hasLoadedEditRef와
  // 달리 cleanup에서 되돌리지 않는 대신, 복원이 실제로 끝난 뒤에만 채워 넣는
  // 방식으로 React 개발 모드의 StrictMode 이중 마운트에도 안전하게 동작합니다.
  const imagesRestoredForRef = useRef<string | null>(null);
  // 원격 글(Supabase Storage)의 첨부 이미지를 File로 복원하는 중인 동안 true.
  // 이 복원은 네트워크 요청이 필요해 시간이 걸리는데, 끝나기 전에 저장을
  // 누르면 attachedImages가 아직 비어있어 멀쩡한 첨부 이미지가 지워지는 문제가
  // 있었습니다(실제로 겪은 문제 — 본문 텍스트만 고쳐도 이미지가 사라짐).
  // 복원이 끝날 때까지 저장 버튼을 막아 이 경합을 원천 차단합니다.
  const [isRestoringImages, setIsRestoringImages] = useState(false);
  // 첨부 이미지 복원이 끝나기 전엔 저장을 막습니다(위 isRestoringImages 설명 참고).
  const saveDisabled = isEditEntryLoading || allRemoteEntriesLoading || isEditLocked || isRestoringImages;

  useEffect(() => {
    attachedImagesRef.current = attachedImages;
  }, [attachedImages]);

  useEffect(() => {
    return () => {
      attachedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  useEffect(() => {
    if (!editId || hasLoadedEditRef.current === editId || !existingEntry) return;
    hasLoadedEditRef.current = editId;
    imagesTouchedRef.current = false;

    const [entryYear, entryMonth, entryDay] = existingEntry.date
      .split("-")
      .map(Number);
    const loadedDate = new Date(entryYear, entryMonth - 1, entryDay);

    setDate(loadedDate);
    // Supabase에서 불러온 글(existingEntry.source === "remote")도
    // mood_key/weather_key 컬럼 덕분에 원래 기분/날씨가 그대로 복원됩니다.
    setMood(existingEntry.mood);
    setWeather(existingEntry.weather);
    setTitle(existingEntry.title);
    setContent(existingEntry.content);
    setEntryId(existingEntry.id);
    createdAtRef.current = existingEntry.createdAt;
    setSaved(true);
    setBaseline({
      date: loadedDate,
      mood: existingEntry.mood,
      weather: existingEntry.weather,
      title: existingEntry.title,
      content: existingEntry.content,
    });
  }, [editId, existingEntry]);

  // 첨부 이미지 복원(저장된 data URL/Storage URL → File)은 위 effect와 별도로
  // 둡니다. 예전엔 한 effect 안에 같이 있었는데, 그 effect는 hasLoadedEditRef로
  // "이 editId는 이미 처리했음"을 표시해 두 번 다시 실행되지 않게 막습니다 —
  // 텍스트 필드를 그대로 다시 채우는 건 몇 번 반복해도 무해하지만, 이미지 복원은
  // 네트워크 요청이 끝나기 전에 React 개발 모드(StrictMode)가 effect를 한 번
  // cleanup 후 다시 실행하면 얘기가 달라집니다: cleanup으로 첫 번째 시도가
  // cancelled 처리되는데, hasLoadedEditRef가 이미 채워져 있어 두 번째 실행은
  // 맨 위에서 바로 걸러져 다시 시도되지 않고, 결국 이미지 복원도 저장 버튼도
  // "진행 중" 상태에 영원히 멈춰버리는 문제가 있었습니다(실제로 겪은 문제 —
  // 기존 글을 고치러 들어가면 저장 버튼이 계속 비활성화된 채였고, 첨부
  // 이미지도 빈 채로 보임). imagesRestoredForRef는 복원이 실제로 끝난 뒤에만
  // 채워 넣어, cleanup에 의해 취소된 시도는 이 표시를 남기지 않고 다음 실행이
  // 다시 정상적으로 복원을 끝낼 수 있게 합니다.
  useEffect(() => {
    if (!editId || !existingEntry) return;
    // 이미 이 글의 이미지를 복원했거나, 그 사이 사용자가 첨부를 직접
    // 추가/삭제했다면 다시 복원해 그 변경을 덮어쓰지 않습니다.
    if (imagesRestoredForRef.current === editId || imagesTouchedRef.current) return;

    const hasImagesToRestore = existingEntry.images.length > 0;
    setIsRestoringImages(hasImagesToRestore);
    // 첨부 없는 글로 전환된 경우, 다른 글을 고치던 중 남아있을 수 있는 이전
    // 첨부 이미지를 비웁니다(있을 때는 그대로 두고 아래에서 새로 복원합니다).
    setAttachedImages((prev) => (!hasImagesToRestore && prev.length > 0 ? [] : prev));

    if (!hasImagesToRestore) {
      imagesRestoredForRef.current = editId;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const restored = await Promise.all(
          existingEntry.images.map(async (dataUrl, index) => {
            const file = await storedImageToFile(dataUrl, `image-${index}.jpg`);
            const image: AttachedImage = {
              id: nextImageId.current++,
              file,
              url: URL.createObjectURL(file),
              zoomLevel: 0,
            };
            return image;
          })
        );
        if (!cancelled) {
          setAttachedImages(restored);
          imagesRestoredForRef.current = editId;
        }
      } catch (error) {
        // 복원에 실패해도(네트워크 오류 등) attachedImages를 비워둔 채로 두면
        // 안 됩니다 — buildEntryFromState는 이미지를 직접 건드리지 않은
        // 이상(imagesTouchedRef) attachedImages 대신 existingEntry.images를
        // 그대로 재사용하므로 저장 자체는 안전하지만, 화면에는 첨부 이미지가
        // 비어 보이는 채로 남아 사용자가 혼란스러울 수 있어 콘솔에 기록만
        // 남깁니다. imagesRestoredForRef는 채우지 않아 다음 기회에 다시
        // 시도할 수 있게 둡니다.
        console.error("첨부 이미지 복원 실패", error);
      } finally {
        if (!cancelled) setIsRestoringImages(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editId, existingEntry]);

  const hasAttachment = attachedImages.length > 0;
  // 최초(또는 불러온 글의) 상태에서 조금이라도 값이 바뀌었는지 — 닫기 경고를 띄울지 여부에 씁니다.
  const isDirty =
    title !== baseline.title ||
    content !== baseline.content ||
    mood !== baseline.mood ||
    weather !== baseline.weather ||
    date.getTime() !== baseline.date.getTime() ||
    hasAttachment;

  function handleReset() {
    const defaults = createDefaults();
    setDate(defaults.date);
    setMood(defaults.mood);
    setWeather(defaults.weather);
    setTitle(defaults.title);
    setContent(defaults.content);
    setSaved(false);
    setAttachedImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.url));
      return [];
    });
    setSelectedImageId(null);
    setEntryId(crypto.randomUUID());
    setBaseline(defaults);
    createdAtRef.current = null;
    hasLoadedEditRef.current = null;
    imagesTouchedRef.current = false;
    imagesRestoredForRef.current = null;
  }

  async function buildEntryFromState(): Promise<DiaryEntry> {
    if (!createdAtRef.current) {
      createdAtRef.current = new Date().toISOString();
    }
    // 기존 글을 고치는 중인데 첨부 이미지 자체는 건드리지 않았다면(추가/삭제
    // 없음), attachedImages를 다시 인코딩하는 대신 원본 이미지를 그대로
    // 재사용합니다. "변경하는 내용만 반영하고 나머지는 그대로 유지"라는
    // 정책을 지키기 위함이기도 하고, attachedImages가 아직 복원 중이거나
    // (원격 글은 Storage에서 다시 내려받아야 함) 복원에 실패해 비어있는
    // 경우에도 멀쩡한 첨부 이미지가 지워지지 않도록 막는 안전장치이기도
    // 합니다(실제로 겪은 문제 — 본문 텍스트만 고쳐도 첨부 이미지가 사라짐).
    const originalEntry =
      hasLoadedEditRef.current && !imagesTouchedRef.current ? existingEntry : null;
    const images = originalEntry
      ? originalEntry.images
      : await Promise.all(attachedImages.map((image) => fileToStoredImage(image.file)));
    return {
      id: entryId,
      date: formatLocalDate(date),
      title: title.trim() || "제목 없음",
      content,
      mood,
      weather,
      hasAttachment: originalEntry ? originalEntry.hasAttachment : hasAttachment,
      images,
      createdAt: createdAtRef.current,
      // 기존 글을 불러와 고치는 세션에서 저장할 때만 "수정됨"으로 표시합니다
      // — 새 글을 작성하는 중에 여러 번 저장해도(아직 한 번도 "완성된 글"로
      // 취급된 적 없음) 수정한 것으로 보이지 않게 합니다.
      updatedAt: hasLoadedEditRef.current ? new Date().toISOString() : undefined,
      // 저장 시점의 환경 설정을 함께 반영합니다(요구사항) — 제목란은
      // 폰트명/색상만, 본문란은 다섯 항목 모두.
      titleStyle: {
        fontFamily: envSettings.fontFamily,
        fontColor: envSettings.fontColor,
      },
      contentStyle: {
        fontFamily: envSettings.fontFamily,
        fontSize: envSettings.fontSize,
        fontColor: envSettings.fontColor,
        textAlign: envSettings.textAlign,
        backgroundType: envSettings.backgroundType,
        backgroundColor: envSettings.backgroundColor,
      },
    };
  }

  function handleContentChange(nextContent: string) {
    setContent(nextContent);
    // 저장된 뒤에 본문을 다시 수정(비우는 것 포함)하면 '변경된 상태'로 간주해
    // 저장 아이콘을 원복합니다 — 이후 닫기 버튼을 누르면 미저장 경고가 뜹니다.
    if (saved) setSaved(false);
  }

  async function handleSaveClick() {
    // 버튼은 saveDisabled일 때 pointer-events-none으로 막아두지만, 방어적으로
    // 한 번 더 확인합니다(entryId/전체 목록이 아직 준비 전이면 저장하지 않음).
    if (saveDisabled) return;
    if (content.trim() === "") {
      setDialog({ type: "empty-content" });
      return;
    }
    // 하루에 하나의 일기만 허용합니다 — 이 글(entryId) 자신은 제외하고, 선택한
    // 날짜에 다른 글이 이미 있으면 저장을 막고 경고창을 띄웁니다.
    const targetDate = formatLocalDate(date);
    const hasDuplicateDate = allEntries.some(
      (other) => other.id !== entryId && other.date === targetDate
    );
    if (hasDuplicateDate) {
      setDialog({ type: "duplicate-date" });
      return;
    }
    // 본문(글 내용)이 저장의 필수 조건이며, 날짜/기분/날씨/제목/첨부 이미지는
    // 함께 부가적으로 저장됩니다. "그날을 거닐다" 목록에 즉시 반영됩니다.
    const entry = await buildEntryFromState();
    addSavedDiaryEntry(entry);
    setSaved(true);
    // Supabase에도 반영합니다 — entryId가 Supabase에서 불러온 글("mem-<id>")을
    // 고치는 중이면 그 행을 갱신하고, 그 외엔(새 글이거나 로컬 글 수정) 새
    // 행으로 추가합니다. 실패해도(네트워크 오류 등) 이미 반영된 로컬 저장은
    // 그대로 둡니다.
    if (isRemoteEntryId(entryId)) {
      void updateMemoryEntry(entryId, entry);
    } else {
      // 처음 Supabase에 추가하는 경우 — 추가에 성공하면 이 글의 entryId를
      // 방금 발급된 원격 id("mem-<id>")로 갱신합니다. 이걸 안 하면 entryId가
      // 계속 로컬 uuid로 남아있어, 같은 글쓰기 세션에서(모달을 닫지 않고)
      // 다시 고쳐 저장할 때도 매번 updateMemoryEntry 대신 insertMemoryEntry가
      // 또 호출되어 같은 날짜의 글이 하나 더 생기는 문제가 있었습니다
      // (실제로 겪은 문제 — Supabase에 같은 created_at을 가진 서로 다른 두
      // 행이 남아있는 것으로 확인함).
      //
      // entryId 상태뿐 아니라 로컬 저장소(savedDiaryEntries)에 남아있는 이
      // 글의 id도 함께 바꿔야 합니다 — 안 그러면 이 모달을 닫고 "그날을
      // 거닐다" 목록에서 이 글을 다시 열어 고칠 때, 목록이 로컬 사본(옛
      // uuid)을 우선해서 보여주는 바람에 DiaryWriteForm이 다시 "새 글"로
      // 착각해 저장할 때마다 insertMemoryEntry를 또 호출하고, Supabase에
      // 같은 글이 계속 중복으로 쌓이는 문제가 있었습니다(실제로 겪은 문제).
      const insertedLocalId = entry.id;
      insertMemoryEntry(entry).then((ok) => {
        if (!ok) return;
        const remoteId = getSyncedRemoteId(insertedLocalId);
        if (remoteId) {
          setEntryId(remoteId);
          updateSavedDiaryEntryId(insertedLocalId, remoteId);
          // 로컬 저장소의 id를 remoteId로 바꿔치기한 뒤에도
          // suppressSyncedDuplicates가 이 글을 계속 "동기화됨"으로 인식하도록
          // 자기 자신 매핑을 추가합니다 — 안 그러면 다음에 목록이 Supabase를
          // 다시 조회할 때 같은 글이 로컬·원격 두 항목으로 겹쳐 보이며 React가
          // "두 자식이 같은 key(mem-<n>)를 가짐" 경고를 냅니다(실제로 겪은
          // 문제).
          confirmSyncedRemoteId(remoteId);
        }
      });
    }
  }

  function handleDeleteClick() {
    setDialog({ type: "delete-confirm" });
  }

  function handleConfirmDelete() {
    // 로컬 사본과, (원격 글이거나 이번 세션에 Supabase로도 동기화된 로컬
    // 글이면) Supabase 쪽까지 함께 지웁니다.
    void deleteDiaryEntryEverywhere(entryId);
    setSaved(false); // 저장돼 있던 글을 삭제했으니 저장 아이콘도 원복
    setDialog({ type: "delete-done" });
  }

  function handleCancelDelete() {
    setDialog({ type: "none" });
  }

  function handleAcknowledgeDeleted() {
    setDialog({ type: "none" });
    handleReset();
    router.back(); // 시간을 붙잡다 모달창도 함께 닫힘
  }

  function handleCloseAttempt() {
    // 저장했거나, 처음 연 뒤로 아무것도 바꾸지 않았다면 경고 없이 바로 닫습니다.
    if (saved || !isDirty) {
      router.back();
      return;
    }
    setDialog({ type: "close-confirm" });
  }

  function handleConfirmClose() {
    setDialog({ type: "none" });
    router.back();
  }

  function handleCancelClose() {
    setDialog({ type: "none" });
  }

  function attachImageFiles(fileList: FileList | File[] | null | undefined) {
    if (!fileList) return { addedCount: 0, hadDuplicate: false };
    // 기존 글의 첨부 이미지를 아직 복원하는 중이면 건드리지 않게 막습니다 —
    // 복원이 끝나면 그 결과가 attachedImages 전체를 통째로 덮어써, 이 동안
    // 새로 첨부한 이미지가 조용히 사라지는 문제가 있었습니다.
    if (isRestoringImages) return { addedCount: 0, hadDuplicate: false };
    const remaining = MAX_IMAGES - attachedImages.length;
    if (remaining <= 0) return { addedCount: 0, hadDuplicate: false };

    const incoming = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/")
    );
    if (incoming.length === 0) return { addedCount: 0, hadDuplicate: false };

    const accepted: File[] = [];
    let hadDuplicate = false;
    for (const file of incoming) {
      if (accepted.length >= remaining) break;
      const isDuplicate =
        attachedImages.some((image) => isSameImageFile(image.file, file)) ||
        accepted.some((f) => isSameImageFile(f, file));
      if (isDuplicate) {
        hadDuplicate = true;
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return { addedCount: 0, hadDuplicate };

    const newImages: AttachedImage[] = accepted.map((file) => ({
      id: nextImageId.current++,
      file,
      url: URL.createObjectURL(file),
      zoomLevel: 0,
    }));

    // 좌측부터 순차적으로 이어붙여 배치 (첨부는 저장 상태에 영향을 주지 않음)
    setAttachedImages((prev) => [...prev, ...newImages]);
    setSelectedImageId(newImages[newImages.length - 1].id);
    imagesTouchedRef.current = true;

    return { addedCount: newImages.length, hadDuplicate };
  }

  function handleRemoveSelectedImage() {
    if (selectedImageId === null) return;
    setAttachedImages((prev) => {
      const target = prev.find((image) => image.id === selectedImageId);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((image) => image.id !== selectedImageId);
    });
    setSelectedImageId(null);
    imagesTouchedRef.current = true;
  }

  function updateSelectedImageZoom(update: (level: number) => number) {
    if (selectedImageId === null) return;
    setAttachedImages((prev) =>
      prev.map((image) =>
        image.id === selectedImageId
          ? { ...image, zoomLevel: update(image.zoomLevel) }
          : image
      )
    );
  }

  function handleZoomInSelected() {
    updateSelectedImageZoom((level) => Math.min(MAX_ZOOM, level + 1));
  }

  function handleZoomOutSelected() {
    // 클릭할 때마다 한 단계씩 축소 (+2 → -2까지 총 4번 클릭)
    updateSelectedImageZoom((level) => Math.max(MIN_ZOOM, level - 1));
  }

  const dateLabel = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS_KO[date.getDay()]}요일`;

  return (
    <>
      <Modal title="시간을 붙잡다" size="xl" tall onClose={handleCloseAttempt}>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <DiaryWriteToolbar
            onSave={handleSaveClick}
            onDelete={handleDeleteClick}
            onOpenAttach={() => setIsAttachOpen(true)}
            saved={saved}
            hasAttachment={hasAttachment}
            saveDisabled={saveDisabled}
          />
          <div className="flex shrink-0 flex-col divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
            <DiaryDateField value={date} onChange={setDate} />
            <div className="flex flex-wrap items-center gap-2 px-3 py-1 sm:gap-3 sm:px-4">
              <DiaryMoodField value={mood} onChange={setMood} />
              <DiaryWeatherField value={weather} onChange={setWeather} />
            </div>
            <DiaryTitleField
              value={title}
              onChange={setTitle}
              fontFamily={envSettings.fontFamily}
              fontColor={envSettings.fontColor}
            />
          </div>
          <DiaryContentField
            value={content}
            onChange={handleContentChange}
            fontFamily={envSettings.fontFamily}
            fontSize={envSettings.fontSize}
            fontColor={envSettings.fontColor}
            textAlign={envSettings.textAlign}
            backgroundType={envSettings.backgroundType}
            backgroundColor={envSettings.backgroundColor}
          />
        </div>
      </Modal>

      {isAttachOpen && (
        <ImageAttachModal
          onClose={() => setIsAttachOpen(false)}
          images={attachedImages}
          selectedId={selectedImageId}
          onSelect={setSelectedImageId}
          onAttachFiles={attachImageFiles}
          onRemoveSelected={handleRemoveSelectedImage}
          onZoomIn={handleZoomInSelected}
          onZoomOut={handleZoomOutSelected}
        />
      )}

      {dialog.type === "empty-content" && (
        <NoticeDialog
          icon={warningSignIcon}
          message={"[일기내용]을 입력하세요"}
          onConfirm={() => setDialog({ type: "none" })}
        />
      )}
      {dialog.type === "duplicate-date" && (
        <NoticeDialog
          icon={warningSignIcon}
          message={`${dateLabel}에는 이미 작성된 일기가 있습니다.\n하루에 하나의 일기만 저장할 수 있습니다.`}
          onConfirm={() => setDialog({ type: "none" })}
          wide
        />
      )}
      {isEditLocked && (
        <NoticeDialog
          icon={warningSignIcon}
          message={"작성 당일에만 수정할 수 있습니다.\n하루가 지난 일기는 고칠 수 없습니다."}
          onConfirm={() => router.back()}
          wide
        />
      )}
      {dialog.type === "delete-confirm" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message={`${dateLabel} 일기를 삭제합니다.\n계속 진행하시겠습니까?`}
          confirmLabel="예"
          onConfirm={handleConfirmDelete}
          cancelLabel="아니요"
          onCancel={handleCancelDelete}
          confirmFirst
          wide
        />
      )}
      {dialog.type === "delete-done" && (
        <NoticeDialog
          icon={letterIIcon}
          message="삭제되었습니다."
          onConfirm={handleAcknowledgeDeleted}
        />
      )}
      {dialog.type === "close-confirm" && (
        <NoticeDialog
          icon={questionMarkIcon}
          message={"변경 내용이 저장되지 않았습니다.\n일기쓰기를 취소하시겠습니까?"}
          confirmLabel="예"
          onConfirm={handleConfirmClose}
          cancelLabel="아니요"
          onCancel={handleCancelClose}
          confirmFirst
        />
      )}
    </>
  );
}

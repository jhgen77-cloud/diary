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
import { formatLocalDate, type DiaryEntry } from "@/lib/mockDiaryEntries";
import {
  addSavedDiaryEntry,
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
  const { entry: remoteExistingEntry } = useRemoteMemoryEntry(
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
  const { entries: allRemoteEntries } = useMemoryEntries(allSavedEntries);
  const allEntries = [...allSavedEntries, ...allRemoteEntries];

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
  const hasLoadedEditRef = useRef(false);

  // 첨부 이미지 상태는 "시간을 붙잡다" 모달(이 컴포넌트)이 살아있는 동안 유지됩니다.
  // 이미지 첨부 모달은 열고 닫아도 이 상태를 그대로 두므로 첨부 내용이 사라지지 않습니다.
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const nextImageId = useRef(0);
  const attachedImagesRef = useRef<AttachedImage[]>([]);

  useEffect(() => {
    attachedImagesRef.current = attachedImages;
  }, [attachedImages]);

  useEffect(() => {
    return () => {
      attachedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, []);

  useEffect(() => {
    if (!editId || hasLoadedEditRef.current || !existingEntry) return;
    hasLoadedEditRef.current = true;

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

    // 첨부 이미지도 복원합니다(저장된 data URL → File). 목록 화면에 보이던
    // 순서(좌측부터)를 그대로 유지합니다.
    let cancelled = false;
    (async () => {
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
      if (!cancelled) setAttachedImages(restored);
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
  }

  async function buildEntryFromState(): Promise<DiaryEntry> {
    if (!createdAtRef.current) {
      createdAtRef.current = new Date().toISOString();
    }
    // 첨부 이미지를 저장용(리사이즈된 data URL)으로 인코딩합니다.
    const images = await Promise.all(
      attachedImages.map((image) => fileToStoredImage(image.file))
    );
    return {
      id: entryId,
      date: formatLocalDate(date),
      title: title.trim() || "제목 없음",
      content,
      mood,
      weather,
      hasAttachment,
      images,
      createdAt: createdAtRef.current,
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
      void insertMemoryEntry(entry);
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

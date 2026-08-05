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
  removeSavedDiaryEntry,
  useSavedDiaryEntry,
} from "@/lib/savedDiaryEntries";

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
  | { type: "delete-confirm" }
  | { type: "delete-done" }
  | { type: "close-confirm" };

export default function DiaryWriteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const existingEntry = useSavedDiaryEntry(editId);

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
    // 본문(글 내용)이 저장의 필수 조건이며, 날짜/기분/날씨/제목/첨부 이미지는
    // 함께 부가적으로 저장됩니다. "그날을 거닐다" 목록에 즉시 반영됩니다.
    const entry = await buildEntryFromState();
    addSavedDiaryEntry(entry);
    setSaved(true);
  }

  function handleDeleteClick() {
    setDialog({ type: "delete-confirm" });
  }

  function handleConfirmDelete() {
    removeSavedDiaryEntry(entryId); // 목록에 저장돼 있었다면 함께 제거
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
      <Modal title="시간을 붙잡다" size="lg" tall onClose={handleCloseAttempt}>
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <DiaryWriteToolbar
            onSave={handleSaveClick}
            onDelete={handleDeleteClick}
            onOpenAttach={() => setIsAttachOpen(true)}
            saved={saved}
            hasAttachment={hasAttachment}
          />
          <div className="flex shrink-0 flex-col divide-y divide-black/[.06] rounded-2xl border border-black/[.06] dark:divide-white/[.08] dark:border-white/[.08]">
            <DiaryDateField value={date} onChange={setDate} />
            <div className="flex flex-wrap items-center gap-2 px-3 py-1 sm:gap-3 sm:px-4">
              <DiaryMoodField value={mood} onChange={setMood} />
              <DiaryWeatherField value={weather} onChange={setWeather} />
            </div>
            <DiaryTitleField value={title} onChange={setTitle} />
          </div>
          <DiaryContentField value={content} onChange={handleContentChange} />
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

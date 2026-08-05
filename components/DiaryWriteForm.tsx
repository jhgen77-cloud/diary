"use client";

import { useEffect, useRef, useState } from "react";
import DiaryWriteToolbar from "@/components/DiaryWriteToolbar";
import DiaryDateField from "@/components/DiaryDateField";
import DiaryMoodField from "@/components/DiaryMoodField";
import DiaryWeatherField from "@/components/DiaryWeatherField";
import DiaryTitleField from "@/components/DiaryTitleField";
import DiaryContentField from "@/components/DiaryContentField";
import ImageAttachModal from "@/components/ImageAttachModal";
import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";
import {
  MAX_IMAGES,
  MAX_ZOOM,
  MIN_ZOOM,
  isSameImageFile,
  type AttachedImage,
} from "@/lib/imageAttachment";

function createDefaults() {
  return {
    date: new Date(),
    mood: "none" as MoodKey,
    weather: null as WeatherKey | null,
    title: "",
    content: "",
  };
}

export default function DiaryWriteForm() {
  const [date, setDate] = useState(() => createDefaults().date);
  const [mood, setMood] = useState<MoodKey>(() => createDefaults().mood);
  const [weather, setWeather] = useState<WeatherKey | null>(
    () => createDefaults().weather
  );
  const [title, setTitle] = useState(() => createDefaults().title);
  const [content, setContent] = useState(() => createDefaults().content);
  const [isAttachOpen, setIsAttachOpen] = useState(false);

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

  // 제목/본문/기분(선택안함 아님)/첨부 이미지 중 하나라도 있으면 "저장됨"으로 취급합니다.
  // 넷 다 초기 상태로 돌아오면 저장/첨부 아이콘도 기본(파란색 아님) 모습으로 되돌아갑니다.
  const hasDiaryContent =
    mood !== "none" ||
    title.trim() !== "" ||
    content.trim() !== "" ||
    attachedImages.length > 0;
  const hasAttachment = attachedImages.length > 0;

  function handleReset() {
    const defaults = createDefaults();
    setDate(defaults.date);
    setMood(defaults.mood);
    setWeather(defaults.weather);
    setTitle(defaults.title);
    setContent(defaults.content);
    setAttachedImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.url));
      return [];
    });
    setSelectedImageId(null);
  }

  function handleSave() {
    // 저장 기능은 준비 중입니다.
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

    // 좌측부터 순차적으로 이어붙여 배치
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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <DiaryWriteToolbar
        onSave={handleSave}
        onReset={handleReset}
        onOpenAttach={() => setIsAttachOpen(true)}
        saved={hasDiaryContent}
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
      <DiaryContentField value={content} onChange={setContent} />
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
    </div>
  );
}

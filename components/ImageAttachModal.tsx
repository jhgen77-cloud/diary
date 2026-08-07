"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import {
  addImageIcon,
  removeSelectionIcon,
  zoomInIcon,
  zoomOutIcon,
} from "@/lib/diaryIcons";
import {
  MAX_IMAGES,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_STEP,
  type AttachedImage,
} from "@/lib/imageAttachment";

interface ImageAttachModalProps {
  onClose: () => void;
  images: AttachedImage[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAttachFiles: (
    fileList: FileList | File[] | null | undefined
  ) => { addedCount: number; hadDuplicate: boolean };
  onRemoveSelected: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const toolButtonClass =
  "group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] active:scale-90 disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9";

const tooltipClass =
  "pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 text-[0.65rem] whitespace-nowrap text-[var(--text)] opacity-0 transition-opacity group-hover:opacity-100";

export default function ImageAttachModal({
  onClose,
  images,
  selectedId,
  onSelect,
  onAttachFiles,
  onRemoveSelected,
  onZoomIn,
  onZoomOut,
}: ImageAttachModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);

  const isFull = images.length >= MAX_IMAGES;
  const selectedImage = images.find((image) => image.id === selectedId) ?? null;

  function showWarning(message: string) {
    setWarning(message);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setWarning(null), 2000);
  }

  function handleAttachFiles(fileList: FileList | File[] | null | undefined) {
    const { hadDuplicate } = onAttachFiles(fileList);
    if (hadDuplicate) showWarning("중복된 이미지입니다!");
  }

  function handleAddImageClick() {
    fileInputRef.current?.click();
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    handleAttachFiles(event.dataTransfer.files);
  }

  return (
    <Modal
      title="이미지 첨부"
      size="lg"
      onClose={onClose}
      overlay={false}
      defaultOffset={{ x: 64, y: 48 }}
    >
      <div className="relative flex min-h-0 flex-1 flex-col gap-3">
        {warning && (
          <div className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--error)] px-3 py-1 text-xs font-medium whitespace-nowrap text-white">
            {warning}
          </div>
        )}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handleAddImageClick}
            disabled={isFull}
            aria-label="이미지 추가"
            className={toolButtonClass}
          >
            <span className="relative aspect-square h-4 w-4 sm:h-5 sm:w-5">
              <Image
                src={addImageIcon}
                alt="이미지 추가"
                fill
                className="object-contain"
              />
            </span>
            <span className={tooltipClass}>이미지 추가</span>
          </button>
          <button
            type="button"
            onClick={onRemoveSelected}
            disabled={!selectedImage}
            aria-label="선택 해제"
            className={toolButtonClass}
          >
            <span className="relative aspect-square h-4 w-4 sm:h-5 sm:w-5">
              <Image
                src={removeSelectionIcon}
                alt="선택 해제"
                fill
                className="object-contain"
              />
            </span>
            <span className={tooltipClass}>선택 해제</span>
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            disabled={!selectedImage || selectedImage.zoomLevel >= MAX_ZOOM}
            aria-label="확대"
            className={toolButtonClass}
          >
            <span className="relative aspect-square h-4 w-4 sm:h-5 sm:w-5">
              <Image
                src={zoomInIcon}
                alt="확대"
                fill
                className="object-contain"
              />
            </span>
            <span className={tooltipClass}>확대</span>
          </button>
          <button
            type="button"
            onClick={onZoomOut}
            disabled={!selectedImage || selectedImage.zoomLevel <= MIN_ZOOM}
            aria-label="축소"
            className={toolButtonClass}
          >
            <span className="relative aspect-square h-4 w-4 sm:h-5 sm:w-5">
              <Image
                src={zoomOutIcon}
                alt="축소"
                fill
                className="object-contain"
              />
            </span>
            <span className={tooltipClass}>축소</span>
          </button>
          <span className="ml-1 text-[0.65rem] text-[var(--text-sub)] sm:text-xs">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>

        {/* 가로: 썸네일(96px) 5개 + 간격/여백/테두리 딱 맞는 564px. 세로: 썸네일 한 줄 높이(132px)로 축소 */}
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative flex h-[132px] w-[564px] max-w-full shrink-0 overflow-auto rounded-2xl border-2 border-dashed p-4 transition-colors ${
            images.length === 0 ? "items-center justify-center" : "items-start justify-start"
          } ${
            isDragOver
              ? "border-[var(--accent)] bg-[var(--accent)]/10"
              : "border-[var(--border)]"
          }`}
        >
          {images.length === 0 ? (
            <p className="pointer-events-none text-center text-sm text-[var(--text-sub)] sm:text-base">
              이미지를 드래그해서 추가하세요.
            </p>
          ) : (
            <div className="flex flex-wrap items-start justify-start gap-3">
              {images.map((image) => {
                const scale = 1 + image.zoomLevel * ZOOM_STEP;
                const isSelected = image.id === selectedId;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => onSelect(image.id)}
                    aria-label={image.file.name}
                    aria-pressed={isSelected}
                    className={`flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl transition-all ${
                      isSelected
                        ? "bg-black/10 opacity-100"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- 사용자 로컬 파일 미리보기(blob URL)라 next/image 최적화 대상이 아님 */}
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="max-h-full max-w-full object-contain transition-transform duration-150"
                      style={{ transform: `scale(${scale})` }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            handleAttachFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    </Modal>
  );
}

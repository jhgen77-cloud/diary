"use client";

import { useEffect, useState } from "react";

interface DiaryEntryImagesProps {
  images: string[];
}

const DISPLAY_MS = 4000;
const FADE_MS = 700;

export default function DiaryEntryImages({ images }: DiaryEntryImagesProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // 일정 시간 보여준 뒤 페이드아웃
  useEffect(() => {
    if (images.length <= 1) return;
    const fadeOutTimer = setTimeout(() => setVisible(false), DISPLAY_MS);
    return () => clearTimeout(fadeOutTimer);
  }, [index, images.length]);

  // 페이드아웃이 끝나면 다음 이미지로 넘어가서 다시 페이드인
  useEffect(() => {
    if (visible || images.length <= 1) return;
    const nextTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
      setVisible(true);
    }, FADE_MS);
    return () => clearTimeout(nextTimer);
  }, [visible, images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--hover)] sm:h-48">
      {/* eslint-disable-next-line @next/next/no-img-element -- 로컬 글은 data URL, Supabase에 저장된 글은 Storage 공개 URL이라 next/image 최적화 대상이 아님 */}
      <img
        src={images[index]}
        alt={`첨부 이미지 ${index + 1}/${images.length}`}
        className={`max-h-full max-w-full object-contain transition-opacity duration-700 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      {images.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                dotIndex === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

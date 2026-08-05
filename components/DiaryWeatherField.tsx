"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import IconOption from "@/components/IconOption";
import FieldLabel from "@/components/FieldLabel";
import { WEATHER_ICONS, WEATHER_LABELS, type WeatherKey } from "@/lib/diaryIcons";

interface DiaryWeatherFieldProps {
  value: WeatherKey | null;
  onChange: (weather: WeatherKey | null) => void;
}

const WEATHER_KEYS: WeatherKey[] = [
  "brightness",
  "cloudly",
  "haze",
  "rain",
  "snow",
  "thunderstorm",
];

export default function DiaryWeatherField({
  value,
  onChange,
}: DiaryWeatherFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex min-w-0 flex-1 items-center gap-2"
    >
      <FieldLabel>날씨</FieldLabel>
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="날씨 선택"
          aria-expanded={isOpen}
          className="flex h-5 w-full items-center justify-end gap-1 rounded-xl border border-black/[.06] px-2 transition-colors hover:bg-black/[.06] sm:h-6 sm:px-2.5 dark:border-white/[.08] dark:hover:bg-white/[.08]"
        >
          {value ? (
            <span className="relative aspect-square h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4">
              <Image
                src={WEATHER_ICONS[value]}
                alt={WEATHER_LABELS[value]}
                fill
                className="object-contain"
              />
            </span>
          ) : (
            <span className="text-[0.65rem] whitespace-nowrap text-black/60 sm:text-xs dark:text-zinc-400">
              [선택안함]
            </span>
          )}
          <span
            className={`text-[0.55rem] text-black/50 transition-transform sm:text-[0.6rem] dark:text-zinc-400 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        {isOpen && (
          <div className="absolute top-full right-0 z-10 mt-1 flex flex-col items-center gap-0.5 rounded-xl border border-black/10 bg-zinc-50 p-1.5 shadow-lg dark:border-white/15 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
              aria-label="선택안함"
              aria-pressed={value === null}
              className={`flex h-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[0.6rem] whitespace-nowrap transition-transform active:scale-90 sm:h-6 sm:text-[0.65rem] ${
                value === null
                  ? "bg-black/[.08] text-black ring-1 ring-black/30 dark:bg-white/[.12] dark:text-zinc-50 dark:ring-white/40"
                  : "text-black/60 hover:bg-black/[.06] dark:text-zinc-400 dark:hover:bg-white/[.08]"
              }`}
            >
              선택안함
            </button>
            {WEATHER_KEYS.map((key) => (
              <IconOption
                key={key}
                icon={WEATHER_ICONS[key]}
                label={WEATHER_LABELS[key]}
                selected={value === key}
                onSelect={() => {
                  onChange(key);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

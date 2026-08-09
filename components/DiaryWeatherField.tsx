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
      className="flex min-w-[9.5rem] flex-1 items-center gap-2"
    >
      <FieldLabel>날씨</FieldLabel>
      <div className="relative min-w-0 flex-1">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="날씨 선택"
          aria-expanded={isOpen}
          className="flex h-5 w-full items-center justify-end gap-1 rounded-xl border border-[var(--border)] px-2 transition-colors hover:bg-[var(--hover)] sm:h-6 sm:px-2.5"
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
            <span className="text-[0.65rem] whitespace-nowrap text-[var(--text-sub)] sm:text-xs">
              [선택안함]
            </span>
          )}
          <span
            className={`text-[0.55rem] text-[var(--text-sub)] transition-transform sm:text-[0.6rem] ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
        {isOpen && (
          <div className="absolute top-full right-0 z-10 mt-1 flex flex-col items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--card)] p-1.5">
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
                  ? "bg-[var(--accent)]/10 text-[var(--text)] ring-1 ring-[var(--accent)]/40"
                  : "text-[var(--text-sub)] hover:bg-[var(--hover)]"
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

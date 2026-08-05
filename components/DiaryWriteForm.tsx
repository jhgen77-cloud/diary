"use client";

import { useState } from "react";
import DiaryWriteToolbar from "@/components/DiaryWriteToolbar";
import DiaryDateField from "@/components/DiaryDateField";
import DiaryMoodField from "@/components/DiaryMoodField";
import DiaryWeatherField from "@/components/DiaryWeatherField";
import DiaryTitleField from "@/components/DiaryTitleField";
import DiaryContentField from "@/components/DiaryContentField";
import type { MoodKey, WeatherKey } from "@/lib/diaryIcons";

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
  const [isSaved, setIsSaved] = useState(false);

  function handleReset() {
    const defaults = createDefaults();
    setDate(defaults.date);
    setMood(defaults.mood);
    setWeather(defaults.weather);
    setTitle(defaults.title);
    setContent(defaults.content);
    setIsSaved(false);
  }

  function handleSave() {
    // 저장 기능은 준비 중입니다.
    setIsSaved(true);
  }

  function handleMoodChange(nextMood: MoodKey) {
    setMood(nextMood);
    handleSave(); // 기분 선택 시 자동 저장
  }

  function handleAttach(file: File) {
    setTitle((prev) => (prev.trim() ? prev : file.name));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <DiaryWriteToolbar
        onSave={handleSave}
        onReset={handleReset}
        onAttach={handleAttach}
        saved={isSaved}
      />
      <div className="flex shrink-0 flex-col divide-y divide-black/[.06] rounded-2xl border border-black/[.06] dark:divide-white/[.08] dark:border-white/[.08]">
        <DiaryDateField value={date} onChange={setDate} />
        <div className="flex flex-wrap items-center gap-2 px-3 py-1 sm:gap-3 sm:px-4">
          <DiaryMoodField value={mood} onChange={handleMoodChange} />
          <DiaryWeatherField value={weather} onChange={setWeather} />
        </div>
        <DiaryTitleField value={title} onChange={setTitle} />
      </div>
      <DiaryContentField value={content} onChange={setContent} />
    </div>
  );
}

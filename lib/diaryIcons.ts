import angryIcon from "@/images/mood/angry.png";
import badIcon from "@/images/mood/bad.png";
import sadIcon from "@/images/mood/sad.png";
import sarcasticIcon from "@/images/mood/sarcastic.png";
import smileIcon from "@/images/mood/smile.png";
import noSelectIcon from "@/images/no-select.png";

import brightnessIcon from "@/images/weather/brightness.png";
import cloudlyIcon from "@/images/weather/cloudly.png";
import hazeIcon from "@/images/weather/haze.png";
import rainIcon from "@/images/weather/rain.png";
import snowIcon from "@/images/weather/snow.png";
import thunderstormIcon from "@/images/weather/thunderstorm.png";

import saveIcon from "@/images/save.png";
import wasteBasketIcon from "@/images/waste-basket.png";
import calendarIcon from "@/images/calendar.png";
import imageAttachmentIcon from "@/images/image-attachment.png";

export const MOOD_ICONS = {
  angry: angryIcon,
  bad: badIcon,
  sad: sadIcon,
  sarcastic: sarcasticIcon,
  smile: smileIcon,
  none: noSelectIcon,
} as const;

export const MOOD_LABELS = {
  angry: "화남",
  bad: "기분나쁨",
  sad: "슬픔",
  sarcastic: "냉소",
  smile: "행복",
  none: "선택안함",
} as const;

export const WEATHER_ICONS = {
  brightness: brightnessIcon,
  cloudly: cloudlyIcon,
  haze: hazeIcon,
  rain: rainIcon,
  snow: snowIcon,
  thunderstorm: thunderstormIcon,
} as const;

export const WEATHER_LABELS = {
  brightness: "맑음",
  cloudly: "흐림",
  haze: "안개",
  rain: "비",
  snow: "눈",
  thunderstorm: "뇌우",
} as const;

export { imageAttachmentIcon, saveIcon, wasteBasketIcon, calendarIcon };

export type MoodKey = keyof typeof MOOD_ICONS;
export type WeatherKey = keyof typeof WEATHER_ICONS;

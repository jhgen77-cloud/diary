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

import wasteBasketIcon from "@/images/waste-basket.png";
import calendarIcon from "@/images/calendar.png";
import imageAttachmentIcon from "@/images/image-attachment.png";
import addImageIcon from "@/images/add-image.png";
import removeSelectionIcon from "@/images/remove-selection.png";
import zoomInIcon from "@/images/zoom-in.png";
import zoomOutIcon from "@/images/zoom-out.png";
import warningSignIcon from "@/images/warning-sign.png";
import questionMarkIcon from "@/images/question-mark.png";
import letterIIcon from "@/images/letter-i.png";
import writing1Icon from "@/images/writing1.png";

// DiaryWriteToolbar 전용 — 위 원본들과 그림 자체는 같지만, 캔버스 안에
// 여백이 제각각이라(같은 박스에 넣어도 서로 다른 크기로 보임 — 실제로
// 지적받은 문제) 그림 영역만 남기고 균일한 여백(4%)으로 다시 잘라낸
// 파일입니다(scripts로 생성, images/toolbar/ 참고). 다른 화면(달력 선택,
// 이미지 첨부 등)은 원본을 그대로 쓰고 이 툴바만 이 변형을 씁니다.
import toolbarSaveIcon from "@/images/toolbar/save.png";
import toolbarSaveSavedIcon from "@/images/toolbar/save-saved.png";
import toolbarSecuritySaveIcon from "@/images/toolbar/security-save.png";
import toolbarCalendarIcon from "@/images/toolbar/calendar.png";
import toolbarImageAttachmentIcon from "@/images/toolbar/image-attachment.png";
import toolbarImageAttachmentSavedIcon from "@/images/toolbar/image-attachment-saved.png";
import toolbarWasteBasketIcon from "@/images/toolbar/waste-basket.png";

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

export {
  imageAttachmentIcon,
  addImageIcon,
  removeSelectionIcon,
  zoomInIcon,
  zoomOutIcon,
  wasteBasketIcon,
  calendarIcon,
  warningSignIcon,
  questionMarkIcon,
  letterIIcon,
  writing1Icon,
  toolbarSaveIcon,
  toolbarSaveSavedIcon,
  toolbarSecuritySaveIcon,
  toolbarCalendarIcon,
  toolbarImageAttachmentIcon,
  toolbarImageAttachmentSavedIcon,
  toolbarWasteBasketIcon,
};

export type MoodKey = keyof typeof MOOD_ICONS;
export type WeatherKey = keyof typeof WEATHER_ICONS;

import angryIcon from "@/images/mood/angry.png";
import badIcon from "@/images/mood/bad.png";
import sadIcon from "@/images/mood/sad.png";
import sarcasticIcon from "@/images/mood/sarcastic.png";
import smileIcon from "@/images/mood/smile.png";

import brightnessIcon from "@/images/weather/brightness.png";
import cloudlyIcon from "@/images/weather/cloudly.png";
import hazeIcon from "@/images/weather/haze.png";
import rainIcon from "@/images/weather/rain.png";
import snowIcon from "@/images/weather/snow.png";
import thunderstormIcon from "@/images/weather/thunderstorm.png";

import imageAttachmentIcon from "@/images/image-attachment.png";

export const MOOD_ICONS = {
  angry: angryIcon,
  bad: badIcon,
  sad: sadIcon,
  sarcastic: sarcasticIcon,
  smile: smileIcon,
} as const;

export const WEATHER_ICONS = {
  brightness: brightnessIcon,
  cloudly: cloudlyIcon,
  haze: hazeIcon,
  rain: rainIcon,
  snow: snowIcon,
  thunderstorm: thunderstormIcon,
} as const;

export { imageAttachmentIcon };

export type MoodKey = keyof typeof MOOD_ICONS;
export type WeatherKey = keyof typeof WEATHER_ICONS;

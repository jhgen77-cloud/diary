/** Combined Color Palette(통합형 컬러 팔레트)가 쓰는 색상 변환 유틸리티.
 * 채도/명도 사각형 + 색상(hue) 슬라이더 + hex 입력이 서로 같은 색을 주고받을 수
 * 있도록, HSV <-> HEX 상호 변환만 다룹니다(UI 로직은 컴포넌트 쪽에 둡니다). */

export interface Hsv {
  /** 0~360 */
  h: number;
  /** 0~1 */
  s: number;
  /** 0~1 */
  v: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

/** 유효한 6자리 hex 색상 문자열인지("#" 유무 상관없이). */
export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** "#rrggbb" -> HSV. 잘못된 형식이면 검정(h:0, s:0, v:0)을 돌려줍니다. */
export function hexToHsv(hex: string): Hsv {
  const match = HEX_RE.exec(hex.trim());
  if (!match) return { h: 0, s: 0, v: 0 };

  const r = parseInt(match[1].slice(0, 2), 16) / 255;
  const g = parseInt(match[1].slice(2, 4), 16) / 255;
  const b = parseInt(match[1].slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

/** HSV -> "#rrggbb". */
export function hsvToHex({ h, s, v }: Hsv): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round(clamp((n + m) * 255, 0, 255))
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

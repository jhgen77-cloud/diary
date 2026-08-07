import JSZip from "jszip";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_ICONS, WEATHER_ICONS, type MoodKey, type WeatherKey } from "@/lib/diaryIcons";

/** '기억의 귀환' — ZIP/XML로 백업한 일기를 다시 읽어들여 저장된 데이터와 병합하는
 * 로직. lib/exportDiaryEntries.ts가 만든 diary.xml(+images/) 구조를 그대로 되읽습니다. */

export type ImportOption = "skip" | "overwrite-newer" | "overwrite-source";

const MOOD_KEYS = Object.keys(MOOD_ICONS) as MoodKey[];
const WEATHER_KEYS = Object.keys(WEATHER_ICONS) as WeatherKey[];

function isMoodKey(value: string): value is MoodKey {
  return (MOOD_KEYS as string[]).includes(value);
}

function isWeatherKey(value: string): value is WeatherKey {
  return (WEATHER_KEYS as string[]).includes(value);
}

interface ParsedEntry {
  entry: DiaryEntry;
  /** ZIP 안의 이미지 파일 경로(예: images/{id}-0.jpg). XML 단독 파일에는 이미지가
   * 없어 항상 빈 배열입니다. */
  imagePaths: string[];
}

/** diary.xml 텍스트를 DiaryEntry 목록으로 되돌립니다. 이미지는 아직 데이터 URL로
 * 채우지 않고 경로만 반환하며, ZIP에서 실제 바이트를 읽어야 하는 readImportFile이
 * 마저 채웁니다. */
function parseDiaryXml(xmlText: string): ParsedEntry[] {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("잘못된 백업 파일 형식입니다.");
  }

  const entryNodes = Array.from(doc.querySelectorAll("diary > entry"));
  return entryNodes
    .map((node): ParsedEntry | null => {
      const date = node.getAttribute("date");
      if (!date) return null; // 날짜 없는 항목은 복원할 수 없어 건너뜁니다.

      const moodAttr = node.getAttribute("mood") ?? "";
      const weatherAttr = node.getAttribute("weather") ?? "";
      const imagePaths = Array.from(node.querySelectorAll("images > image"))
        .map((image) => image.textContent ?? "")
        .filter(Boolean);

      const entry: DiaryEntry = {
        id: node.getAttribute("id") || crypto.randomUUID(),
        date,
        title: node.querySelector("title")?.textContent ?? "",
        content: node.querySelector("content")?.textContent ?? "",
        mood: isMoodKey(moodAttr) ? moodAttr : "none",
        weather: isWeatherKey(weatherAttr) ? weatherAttr : null,
        hasAttachment: imagePaths.length > 0,
        images: [],
        createdAt: node.getAttribute("createdAt") || new Date().toISOString(),
      };
      return { entry, imagePaths };
    })
    .filter((parsed): parsed is ParsedEntry => parsed !== null);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** 선택한 백업 파일(.zip 또는 .xml)을 읽어 DiaryEntry 목록으로 되돌립니다.
 * .zip은 diary.xml과 images/ 폴더를 함께 담고 있어 이미지까지 복원되지만, .xml
 * 단독 파일은 이미지 없이 텍스트만 복원됩니다. */
export async function readImportFile(file: File): Promise<DiaryEntry[]> {
  const isZip = file.name.toLowerCase().endsWith(".zip");
  if (!isZip) {
    const xmlText = await file.text();
    return parseDiaryXml(xmlText).map(({ entry }) => entry);
  }

  const zip = await JSZip.loadAsync(file);
  const xmlFile = zip.file("diary.xml");
  if (!xmlFile) throw new Error("diary.xml을 찾을 수 없습니다.");

  const parsed = parseDiaryXml(await xmlFile.async("text"));
  const entries: DiaryEntry[] = [];
  for (const { entry, imagePaths } of parsed) {
    const images: string[] = [];
    for (const path of imagePaths) {
      const imageFile = zip.file(path);
      if (!imageFile) continue;
      images.push(await blobToDataUrl(await imageFile.async("blob")));
    }
    entries.push({ ...entry, images, hasAttachment: images.length > 0 });
  }
  return entries;
}

export interface MergeResult {
  /** 병합 결과 저장할 전체 목록. */
  next: DiaryEntry[];
  /** 가져온 일기 중 하나라도 기존 저장된 일기와 같은 날짜였는지. */
  hasConflict: boolean;
}

/** 가져온 일기를 기존 저장 목록과 병합합니다. 같은 날짜의 일기가 이미 있으면
 * option에 따라 처리하고, 날짜가 겹치지 않는 일기는 항상 그대로 추가합니다. */
export function mergeImportedEntries(
  existing: DiaryEntry[],
  imported: DiaryEntry[],
  option: ImportOption
): MergeResult {
  const next = [...existing];
  let hasConflict = false;

  for (const incoming of imported) {
    const conflictIndex = next.findIndex((entry) => entry.date === incoming.date);
    if (conflictIndex === -1) {
      next.push(incoming); // 겹치는 날짜가 없으면 항상 새로 추가합니다.
      continue;
    }

    hasConflict = true;
    if (option === "skip") continue; // 기존 것을 그대로 둡니다.

    const conflict = next[conflictIndex];
    const winner =
      option === "overwrite-source"
        ? incoming
        : // "overwrite-newer": 이 앱엔 아직 별도의 '수정 일시' 필드가 없어,
          // createdAt(최초 저장 시각)을 최종 수정 일시의 대용으로 비교합니다.
          new Date(incoming.createdAt) > new Date(conflict.createdAt)
          ? incoming
          : conflict;
    next[conflictIndex] = winner;
  }

  return { next, hasConflict };
}

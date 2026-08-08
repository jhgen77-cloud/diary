import JSZip from "jszip";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_ICONS, WEATHER_ICONS, type MoodKey, type WeatherKey } from "@/lib/diaryIcons";
import { stripInvalidXmlChars } from "@/lib/exportDiaryEntries";
import type {
  BackgroundType,
  DiaryContentStyle,
  DiaryTitleStyle,
  FontFamilyKey,
  TextAlignKey,
} from "@/lib/environmentSettings";

/** '기억의 귀환' — ZIP/XML로 백업한 일기를 다시 읽어들여 저장된 데이터와 병합하는
 * 로직. lib/exportDiaryEntries.ts가 만든 diary.xml(+images/) 구조를 그대로 되읽습니다. */

export type ImportOption = "skip" | "overwrite-source";

const MOOD_KEYS = Object.keys(MOOD_ICONS) as MoodKey[];
const WEATHER_KEYS = Object.keys(WEATHER_ICONS) as WeatherKey[];
const FONT_FAMILY_KEYS: FontFamilyKey[] = ["system", "sans", "serif", "mono", "handwriting"];
const TEXT_ALIGN_KEYS: TextAlignKey[] = ["left", "center", "right", "justify"];
const BACKGROUND_TYPE_KEYS: BackgroundType[] = ["none", "solid"];

function isMoodKey(value: string): value is MoodKey {
  return (MOOD_KEYS as string[]).includes(value);
}

function isWeatherKey(value: string): value is WeatherKey {
  return (WEATHER_KEYS as string[]).includes(value);
}

function isFontFamilyKey(value: string): value is FontFamilyKey {
  return (FONT_FAMILY_KEYS as string[]).includes(value);
}

function isTextAlignKey(value: string): value is TextAlignKey {
  return (TEXT_ALIGN_KEYS as string[]).includes(value);
}

function isBackgroundType(value: string): value is BackgroundType {
  return (BACKGROUND_TYPE_KEYS as string[]).includes(value);
}

/** <entry> 속성에서 titleStyle/contentStyle을 되읽습니다. 내보내기 쪽에서 값이
 * 없으면 속성 자체를 안 쓰므로, 필요한 속성이 하나라도 없거나(옛 백업 파일 등)
 * 형식이 안 맞으면 그 스타일 전체를 undefined로 둡니다(entry 자체는 정상
 * 복원되고, 기본 스타일로 보이는 것으로 충분히 안전한 대체 동작입니다). */
function parseTitleStyle(node: Element): DiaryTitleStyle | undefined {
  const fontFamily = node.getAttribute("titleFontFamily") ?? "";
  const fontColor = node.getAttribute("titleFontColor");
  if (!isFontFamilyKey(fontFamily) || !fontColor) return undefined;
  return { fontFamily, fontColor };
}

function parseContentStyle(node: Element): DiaryContentStyle | undefined {
  const fontFamily = node.getAttribute("contentFontFamily") ?? "";
  const fontSizeAttr = node.getAttribute("contentFontSize");
  const fontColor = node.getAttribute("contentFontColor");
  const textAlign = node.getAttribute("contentTextAlign") ?? "";
  const backgroundType = node.getAttribute("contentBackgroundType") ?? "";
  const backgroundColor = node.getAttribute("contentBackgroundColor");
  const fontSize = fontSizeAttr ? Number(fontSizeAttr) : NaN;

  if (
    !isFontFamilyKey(fontFamily) ||
    !Number.isFinite(fontSize) ||
    !fontColor ||
    !isTextAlignKey(textAlign) ||
    !isBackgroundType(backgroundType) ||
    !backgroundColor
  ) {
    return undefined;
  }
  return { fontFamily, fontSize, fontColor, textAlign, backgroundType, backgroundColor };
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
  // XML 1.0에서 유효하지 않은 제어 문자가 섞여 있으면 파싱 자체가 통째로
  // 실패합니다(내보내기 쪽은 이미 걸러서 쓰지만, 예전에 만든 백업 파일에는
  // 남아 있을 수 있어 가져오기 쪽에서도 한 번 더 걸러줍니다).
  const doc = new DOMParser().parseFromString(stripInvalidXmlChars(xmlText), "application/xml");
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
        titleStyle: parseTitleStyle(node),
        contentStyle: parseContentStyle(node),
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

  // images/ 폴더 안의 실제 파일 목록(폴더 항목 자체는 제외)을 미리 모아 둡니다.
  // <image> 태그의 경로 그대로의 파일을 찾지 못했을 때(예: 이미지 파일을 다른
  // 이름/확장자로 교체한 경우) 대신 쓸 후보로 활용합니다.
  const allImageFiles = zip
    .filter((relativePath, zipFile) => relativePath.startsWith("images/") && !zipFile.dir)
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const usedNames = new Set<string>();

  const parsed = parseDiaryXml(await xmlFile.async("text"));
  const entries: DiaryEntry[] = [];
  for (const { entry, imagePaths } of parsed) {
    // 이 항목의 id로 시작하는 파일들 — 이름/확장자만 바뀐 교체를 우선 매칭합니다.
    const idPrefixFiles = allImageFiles.filter((f) => f.name.startsWith(`images/${entry.id}-`));

    const images: string[] = [];
    for (const path of imagePaths) {
      // 1) 적힌 경로 그대로
      let imageFile = zip.file(path);
      // 2) 같은 id로 시작하는, 아직 안 쓰인 파일
      if (!imageFile) imageFile = idPrefixFiles.find((f) => !usedNames.has(f.name)) ?? null;
      // 3) 그래도 못 찾으면, images/ 폴더에 아직 안 쓰인 파일 중 아무거나(완전히
      //    무관한 이름으로 바꿔치기한 경우의 마지막 수단 — 보통 교체 전후로
      //    파일 개수가 같으므로 이 방식으로도 대체로 올바르게 짝지어집니다).
      if (!imageFile) imageFile = allImageFiles.find((f) => !usedNames.has(f.name)) ?? null;
      if (!imageFile) continue;

      usedNames.add(imageFile.name);
      images.push(await blobToDataUrl(await imageFile.async("blob")));
    }
    entries.push({ ...entry, images, hasAttachment: images.length > 0 });
  }
  return entries;
}

/** 여러 백업 파일을 순서대로 읽어 하나의 DiaryEntry 목록으로 합칩니다(가져오기
 * 파일 선택창에서 여러 파일을 한 번에 골랐을 때 사용). 파일들 사이의 충돌(같은
 * id/날짜)은 mergeImportedEntries가 하나로 합쳐진 이 목록을 그대로 순서대로 처리
 * 하면서 알아서 해소합니다 — 뒤에 온 파일의 내용이 우선합니다. */
export async function readImportFiles(files: File[]): Promise<DiaryEntry[]> {
  const results: DiaryEntry[] = [];
  for (const file of files) {
    try {
      results.push(...(await readImportFile(file)));
    } catch (error) {
      // 여러 파일 중 어느 파일에서 실패했는지 알 수 있도록 파일명을 덧붙입니다.
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${file.name}: ${message}`);
    }
  }
  return results;
}

export interface MergeResult {
  /** 병합 결과 저장할 전체 목록. */
  next: DiaryEntry[];
  /** 가져온 일기 중 하나라도 기존(또는 이번 가져오기에서 먼저 반영된) 일기와
   * 같은 날짜였는지. */
  hasConflict: boolean;
  /** 이번 병합으로 새로 추가되거나 내용이 덮어써진 글들(건너뛴 건 제외) —
   * Supabase 동기화처럼 "실제로 바뀐 항목만" 다시 반영해야 하는 후속 작업에
   * 씁니다(DataRestorePanel 참고). */
  touched: DiaryEntry[];
}

/** 가져온 일기를 기존 저장 목록과 병합합니다. 하루에 일기는 하나만 저장할 수
 * 있다는 규칙(DiaryWriteForm에서 저장 시 강제)을 가져오기에도 그대로 적용해,
 * 같은 날짜의 일기가 이미 있으면(기존 목록에 있든, 이번에 가져오는 여러 파일
 * 안에서 먼저 반영됐든) option에 따라 처리하고, 날짜가 겹치지 않는 일기는
 * 그대로 추가합니다.
 *
 * id가 정확히 같은 항목(=정확히 같은 글을 다시 가져오는 경우)을 최우선으로
 * 매칭하고, id가 일치하는 게 없을 때만(예: 다른 기기의 백업처럼 id는 다르지만
 * 날짜가 같은 경우) 날짜로 대체 판단합니다. */
export function mergeImportedEntries(
  existing: DiaryEntry[],
  imported: DiaryEntry[],
  option: ImportOption
): MergeResult {
  const next = [...existing];
  const indexById = new Map(existing.map((entry, index) => [entry.id, index]));
  const indexByDate = new Map(existing.map((entry, index) => [entry.date, index]));
  let hasConflict = false;
  const touched: DiaryEntry[] = [];

  for (const incoming of imported) {
    const sameIdIndex = indexById.get(incoming.id);
    if (sameIdIndex !== undefined) {
      // 정확히 같은 글을 다시 가져온 경우 — 그 글 하나만 갱신합니다.
      hasConflict = true;
      if (option === "skip") continue;
      const target = next[sameIdIndex];
      const merged = { ...incoming, id: target.id, createdAt: target.createdAt };
      next[sameIdIndex] = merged;
      touched.push(merged);
      continue;
    }

    const sameDateIndex = indexByDate.get(incoming.date);
    if (sameDateIndex === undefined) {
      // 겹치는 날짜가 없으면 새로 추가합니다. 방금 추가한 항목도 이후 항목과
      // 같은 규칙으로 비교할 수 있도록 인덱스를 등록해 둡니다 — 이번에 가져오는
      // 여러 파일 안에 같은 날짜(또는 같은 id)의 글이 섞여 있어도 하루에 하나만
      // 남도록 순서대로(뒤에 온 파일이 우선) 정리됩니다.
      const newIndex = next.push(incoming) - 1;
      indexByDate.set(incoming.date, newIndex);
      indexById.set(incoming.id, newIndex);
      touched.push(incoming);
      continue;
    }

    hasConflict = true;
    if (option === "skip") continue; // 기존 것을 그대로 둡니다.

    // option === "overwrite-source": 가져오기 대상 파일의 내용으로 덮어씁니다.
    // id/createdAt(최초 저장 시각)은 기존 항목의 것을 그대로 유지해, "같은 날의
    // 일기를 새 내용으로 갱신"한 것이 되게 합니다. 파일이 나중에 다시 수정돼
    // 다시 가져와도, 그때마다 그 시점의 파일 내용으로 갱신됩니다.
    const target = next[sameDateIndex];
    const merged = { ...incoming, id: target.id, createdAt: target.createdAt };
    next[sameDateIndex] = merged;
    touched.push(merged);
  }

  return { next, hasConflict, touched };
}

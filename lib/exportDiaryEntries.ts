import JSZip from "jszip";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_LABELS, WEATHER_LABELS } from "@/lib/diaryIcons";

/** '기억의 날개' — 저장된 일기를 로컬 폴더에 파일로 내보내는 로직. UI(DataExportPanel 및
 * 하위 컴포넌트)에서 상태만 관리하고, 실제 파일 생성/쓰기는 이 파일에 모아둡니다. */

export type ExportFormat = "zip" | "txt";
// ZIP/TXT 두 형식 모두에서 쓰는 '파일 생성 옵션'. 형식과 무관하게 선택지가 같아
// (하나의 파일 / 연도별 / 연,월별 / 날짜별) 이름도 형식에 매이지 않게 지었습니다.
export type ExportSplitOption = "year" | "single" | "year-month" | "date";

export interface DateValue {
  year: number;
  month: number;
  day: number;
}

export function dateValueToString({ year, month, day }: DateValue) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** DateValue(연/월/일 각각 숫자) <-> Date 상호 변환. MiniCalendarPicker 등 Date를
 * 다루는 컴포넌트와 DateValue 기반 상태를 잇는 용도로 씁니다. */
export function dateValueToDate({ year, month, day }: DateValue): Date {
  return new Date(year, month - 1, day);
}

export function dateToDateValue(date: Date): DateValue {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

/** 시작~종료 일자(순서가 뒤바뀌어 있어도) 범위에 포함되는 일기만 남깁니다. */
export function filterEntriesByDateRange(
  entries: DiaryEntry[],
  start: DateValue,
  end: DateValue
) {
  const a = dateValueToString(start);
  const b = dateValueToString(end);
  const [from, to] = a <= b ? [a, b] : [b, a];
  return entries.filter((entry) => entry.date >= from && entry.date <= to);
}

/** 현재 브라우저가 로컬 폴더 선택(File System Access API)을 지원하는지. */
export function isDirectoryPickerSupported() {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

function sortByDateAsc(entries: DiaryEntry[]) {
  return [...entries].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

function formatEntryText(entry: DiaryEntry) {
  const mood = MOOD_LABELS[entry.mood];
  const weather = entry.weather ? WEATHER_LABELS[entry.weather] : "-";
  return [
    `[${entry.date}] ${entry.title}`,
    `기분: ${mood}  날씨: ${weather}`,
    "-".repeat(24),
    entry.content,
  ].join("\n");
}

interface ExportGroup {
  /** "single"일 때는 빈 문자열. 그 외에는 연도("2026") / 연,월("2026-08") /
   * 날짜("2026-08-07") 문자열 — 파일명을 짓는 쪽에서 형식에 맞게 사용합니다. */
  key: string;
  entries: DiaryEntry[];
}

/** splitOption에 따라 entries를 파일 단위 그룹으로 묶습니다. ZIP/TXT 내보내기가
 * 공유하는 '파일 생성 옵션'의 핵심 로직이며, 실제 파일명/내용 생성은 각 형식
 * 쪽(groupEntriesForTxt/exportEntriesAsZip)에서 이어서 담당합니다. */
function groupEntriesForExport(
  entries: DiaryEntry[],
  splitOption: ExportSplitOption
): ExportGroup[] {
  const sorted = sortByDateAsc(entries);

  if (splitOption === "single") {
    return [{ key: "", entries: sorted }];
  }
  if (splitOption === "date") {
    // 하루에 일기는 하나만 저장할 수 있어(DiaryWriteForm에서 저장 시 강제)
    // entry.date만으로도 파일명이 겹치지 않습니다.
    return sorted.map((entry) => ({ key: entry.date, entries: [entry] }));
  }

  // "year" | "year-month" — 연도(또는 연,월) 단위로 묶습니다.
  const groups = new Map<string, DiaryEntry[]>();
  for (const entry of sorted) {
    const [year, month] = entry.date.split("-");
    const key = splitOption === "year" ? year : `${year}-${month}`;
    const group = groups.get(key);
    if (group) group.push(entry);
    else groups.set(key, [entry]);
  }
  return Array.from(groups.entries()).map(([key, group]) => ({ key, entries: group }));
}

interface TxtFile {
  filename: string;
  content: string;
}

function groupEntriesForTxt(entries: DiaryEntry[], splitOption: ExportSplitOption): TxtFile[] {
  return groupEntriesForExport(entries, splitOption).map((group) => ({
    filename:
      splitOption === "single"
        ? "diary-export.txt"
        : splitOption === "date"
          ? `${group.key}.txt`
          : `diary-${group.key}.txt`,
    content: group.entries.map(formatEntryText).join("\n\n"),
  }));
}

/** TXT 형식으로 내보냅니다. 이미지는 제외하고 텍스트 데이터만 씁니다(암호화된 일기를
 * 걸러내는 기능은, 아직 암호화 기능 자체가 없어 자리만 비워둡니다). */
export async function exportEntriesAsTxt(
  dirHandle: FileSystemDirectoryHandle,
  entries: DiaryEntry[],
  splitOption: ExportSplitOption
) {
  const files = groupEntriesForTxt(entries, splitOption);
  for (const file of files) {
    const fileHandle = await dirHandle.getFileHandle(file.filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file.content);
    await writable.close();
  }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// XML 1.0 명세는 대부분의 제어 문자를 허용하지 않습니다(탭/개행/캐리지리턴은 예외).
// 정규식에 코드 포인트 이스케이프를 직접 쓰면 편집 도구를 거치며 글자가 깨지는
// 문제가 있어, 코드 포인트 숫자를 직접 비교하는 방식으로 우회했습니다.
function isValidXmlCodePoint(codePoint: number) {
  return (
    codePoint === 0x09 || // 탭
    codePoint === 0x0a || // 개행
    codePoint === 0x0d || // 캐리지리턴
    (codePoint >= 0x20 && codePoint <= 0xd7ff) ||
    (codePoint >= 0xe000 && codePoint <= 0xfffd) ||
    (codePoint >= 0x10000 && codePoint <= 0x10ffff)
  );
}

// 다른 프로그램에서 복사해 붙여넣은 본문에 위 범위를 벗어난 제어 문자(예: NUL,
// BEL, 수직 탭)가 섞여 있으면, escapeXml로는 걸러지지 않아 XML 자체가 깨지고,
// 가져오기 때 "파일을 가져오는 중 오류가 발생했습니다" / "가져올 일기를 찾지
// 못했습니다"로 이어지는 문제가 있었습니다(실제로 재현해 확인함). 그런 문자를
// 내보내기 전에 미리 제거합니다.
export function stripInvalidXmlChars(value: string) {
  return Array.from(value)
    .filter((char) => isValidXmlCodePoint(char.codePointAt(0) ?? 0))
    .join("");
}

// titleStyle/contentStyle(환경 설정값)을 <entry> 태그의 추가 속성으로 함께
// 적어 둡니다. 값 자체는 전부 영문/숫자/#hex라 XML 속성에 그대로 써도 안전
// 합니다(escapeXml 불필요). 둘 다 선택 필드라 없으면 속성 자체를 생략합니다
// — 내보내기→초기화→가져오기를 거쳐도 "그날을 거닐다"에서 보던 스타일이
// 그대로 복원되도록 하기 위함입니다(실제로 유실되는 문제가 있어 추가함).
function buildStyleAttrs(entry: DiaryEntry): string {
  const attrs: string[] = [];
  if (entry.titleStyle) {
    attrs.push(`titleFontFamily="${entry.titleStyle.fontFamily}"`);
    attrs.push(`titleFontColor="${entry.titleStyle.fontColor}"`);
  }
  if (entry.contentStyle) {
    attrs.push(`contentFontFamily="${entry.contentStyle.fontFamily}"`);
    attrs.push(`contentFontSize="${entry.contentStyle.fontSize}"`);
    attrs.push(`contentFontColor="${entry.contentStyle.fontColor}"`);
    attrs.push(`contentTextAlign="${entry.contentStyle.textAlign}"`);
    attrs.push(`contentBackgroundType="${entry.contentStyle.backgroundType}"`);
    attrs.push(`contentBackgroundColor="${entry.contentStyle.backgroundColor}"`);
  }
  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

function buildDiaryXml(entries: DiaryEntry[]) {
  const items = entries
    .map((entry) => {
      const images = entry.images
        .map((_, index) => `      <image>images/${entry.id}-${index}.jpg</image>`)
        .join("\n");
      return [
        `  <entry id="${escapeXml(entry.id)}" date="${entry.date}" mood="${entry.mood}" weather="${entry.weather ?? ""}" createdAt="${entry.createdAt}"${buildStyleAttrs(entry)}>`,
        `    <title>${escapeXml(stripInvalidXmlChars(entry.title))}</title>`,
        // CDATA 대신 title과 같은 방식(escapeXml)으로 통일했습니다. 일부
        // 브라우저의 기본 XML 뷰어는 CDATA 구간을 접어서(펼치기 전까진 안 보이게)
        // 보여줘, 압축 풀고 xml을 열어봤을 때 본문이 없는 것처럼 보이는
        // 문제가 있었습니다.
        `    <content>${escapeXml(stripInvalidXmlChars(entry.content))}</content>`,
        images ? `    <images>\n${images}\n    </images>` : "    <images/>",
        `  </entry>`,
      ].join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<diary>\n${items}\n</diary>\n`;
}

async function dataUrlToBlob(dataUrl: string) {
  const response = await fetch(dataUrl);
  return response.blob();
}

// splitOption이 "single"일 때만 쓰는, 내보낸 시각이 담긴 파일명(같은 날 여러 번
// 내보내도 서로 덮어쓰지 않도록). 그 외 옵션은 groupEntriesForZip에서 그룹 키로
// 이름을 짓습니다(TXT 쪽 diary-<key>.txt와 같은 방식).
function buildZipFilename() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `diary-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.zip`;
}

interface ZipFile {
  filename: string;
  entries: DiaryEntry[];
}

function groupEntriesForZip(entries: DiaryEntry[], splitOption: ExportSplitOption): ZipFile[] {
  return groupEntriesForExport(entries, splitOption).map((group) => ({
    filename: splitOption === "single" ? buildZipFilename() : `diary-backup-${group.key}.zip`,
    entries: group.entries,
  }));
}

async function writeZipFile(dirHandle: FileSystemDirectoryHandle, file: ZipFile) {
  const zip = new JSZip();
  zip.file("diary.xml", buildDiaryXml(file.entries));

  const imagesFolder = zip.folder("images");
  for (const entry of file.entries) {
    for (let index = 0; index < entry.images.length; index += 1) {
      const blob = await dataUrlToBlob(entry.images[index]);
      imagesFolder?.file(`${entry.id}-${index}.jpg`, blob);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const fileHandle = await dirHandle.getFileHandle(file.filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

/** ZIP 형식으로 내보냅니다. 일기 메타데이터/본문은 diary.xml에, 첨부 이미지는
 * images/ 폴더에 담아 [가져오기]로 다시 복원할 수 있는 형태로 묶습니다.
 * splitOption에 따라 TXT와 동일하게 하나의 파일로 묶거나 연도/연,월/날짜별로
 * 나눠 여러 개의 zip 파일을 생성합니다. */
export async function exportEntriesAsZip(
  dirHandle: FileSystemDirectoryHandle,
  entries: DiaryEntry[],
  splitOption: ExportSplitOption
) {
  const files = groupEntriesForZip(entries, splitOption);
  for (const file of files) {
    await writeZipFile(dirHandle, file);
  }
}

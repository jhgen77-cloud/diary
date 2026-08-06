import JSZip from "jszip";
import type { DiaryEntry } from "@/lib/mockDiaryEntries";
import { MOOD_LABELS, WEATHER_LABELS } from "@/lib/diaryIcons";

/** '기억의 날개' — 저장된 일기를 로컬 폴더에 파일로 내보내는 로직. UI(DataExportPanel 및
 * 하위 컴포넌트)에서 상태만 관리하고, 실제 파일 생성/쓰기는 이 파일에 모아둡니다. */

export type ExportFormat = "zip" | "txt";
export type TxtSplitOption = "year" | "single" | "year-month" | "date";

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

interface TxtFile {
  filename: string;
  content: string;
}

function groupEntriesForTxt(entries: DiaryEntry[], splitOption: TxtSplitOption): TxtFile[] {
  const sorted = sortByDateAsc(entries);

  if (splitOption === "single") {
    return [
      { filename: "diary-export.txt", content: sorted.map(formatEntryText).join("\n\n") },
    ];
  }
  if (splitOption === "date") {
    return sorted.map((entry) => ({
      filename: `${entry.date}.txt`,
      content: formatEntryText(entry),
    }));
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
  return Array.from(groups.entries()).map(([key, group]) => ({
    filename: `diary-${key}.txt`,
    content: group.map(formatEntryText).join("\n\n"),
  }));
}

/** TXT 형식으로 내보냅니다. 이미지는 제외하고 텍스트 데이터만 씁니다(암호화된 일기를
 * 걸러내는 기능은, 아직 암호화 기능 자체가 없어 자리만 비워둡니다). */
export async function exportEntriesAsTxt(
  dirHandle: FileSystemDirectoryHandle,
  entries: DiaryEntry[],
  splitOption: TxtSplitOption
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

function buildDiaryXml(entries: DiaryEntry[]) {
  const items = entries
    .map((entry) => {
      const images = entry.images
        .map((_, index) => `      <image>images/${entry.id}-${index}.jpg</image>`)
        .join("\n");
      return [
        `  <entry id="${escapeXml(entry.id)}" date="${entry.date}" mood="${entry.mood}" weather="${entry.weather ?? ""}" createdAt="${entry.createdAt}">`,
        `    <title>${escapeXml(entry.title)}</title>`,
        `    <content><![CDATA[${entry.content}]]></content>`,
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

function buildZipFilename() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `diary-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.zip`;
}

/** ZIP 형식으로 내보냅니다. 일기 메타데이터/본문은 diary.xml에, 첨부 이미지는
 * images/ 폴더에 담아 [가져오기]로 다시 복원할 수 있는 형태로 묶습니다. */
export async function exportEntriesAsZip(
  dirHandle: FileSystemDirectoryHandle,
  entries: DiaryEntry[]
) {
  const zip = new JSZip();
  zip.file("diary.xml", buildDiaryXml(entries));

  const imagesFolder = zip.folder("images");
  for (const entry of entries) {
    for (let index = 0; index < entry.images.length; index += 1) {
      const blob = await dataUrlToBlob(entry.images[index]);
      imagesFolder?.file(`${entry.id}-${index}.jpg`, blob);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const fileHandle = await dirHandle.getFileHandle(buildZipFilename(), { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(blob);
  await writable.close();
}

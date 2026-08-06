export {};

// TypeScript의 기본 DOM 라이브러리에는 File System Access API 중
// `window.showDirectoryPicker`가 아직 포함되어 있지 않아 직접 선언합니다.
// (FileSystemDirectoryHandle/FileSystemFileHandle.createWritable 등은 이미 lib.dom에 있습니다.)
declare global {
  interface DirectoryPickerOptions {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?:
      | "desktop"
      | "documents"
      | "downloads"
      | "music"
      | "pictures"
      | "videos"
      | FileSystemHandle;
  }

  interface Window {
    showDirectoryPicker?: (
      options?: DirectoryPickerOptions
    ) => Promise<FileSystemDirectoryHandle>;
  }
}

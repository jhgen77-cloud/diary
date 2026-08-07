export interface AttachedImage {
  id: number;
  file: File;
  url: string;
  zoomLevel: number;
}

export const MAX_IMAGES = 5;
export const MIN_ZOOM = -2;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.2;

export function isSameImageFile(a: File, b: File) {
  return (
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  );
}

const PERSISTED_IMAGE_MAX_DIMENSION = 800;
const PERSISTED_IMAGE_QUALITY = 0.7;

/**
 * 로컬 저장(localStorage)에 넣기 위해 이미지를 적당한 크기로 줄이고
 * data URL(jpeg) 문자열로 인코딩합니다. 원본 파일을 그대로 base64로 넣으면
 * 저장 용량 한도를 금방 넘길 수 있어 캔버스로 리사이즈합니다.
 */
export function fileToStoredImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(
        1,
        PERSISTED_IMAGE_MAX_DIMENSION / Math.max(img.width, img.height)
      );
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      URL.revokeObjectURL(objectUrl);
      if (!ctx) {
        reject(new Error("2D 캔버스 컨텍스트를 가져오지 못했습니다."));
        return;
      }
      // 캔버스는 기본적으로 투명(RGBA 0,0,0,0)합니다. JPEG는 알파 채널이 없어,
      // 투명 PNG 등을 그대로 그린 뒤 toDataURL("image/jpeg")로 내보내면 브라우저가
      // 칠해지지 않은(투명) 픽셀을 검정으로 채워버립니다 — 배경설정으로 본문에
      // 색이 있는 배경을 두면 이 검게 칠해진 영역이 또렷이 보여 이미지가 "블라인드
      // 처리"된 것처럼 보였던 원인입니다(실제로 재현해 확인함). 흰색으로 먼저
      // 채운 뒤 그 위에 그려 투명 영역이 검정 대신 흰색이 되게 합니다.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", PERSISTED_IMAGE_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했습니다."));
    };
    img.src = objectUrl;
  });
}

/** 저장된 data URL을 다시 File로 되돌립니다 (수정 화면에서 첨부 이미지를 복원할 때 사용). */
export async function storedImageToFile(
  dataUrl: string,
  filename: string
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

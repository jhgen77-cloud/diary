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

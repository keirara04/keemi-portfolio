import { projects } from "./content";

export const PRELOAD_IMAGE_URLS: string[] = [
  "https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-homebackground.jpg",
  "https://keemi-spaces-1.sgp1.cdn.digitaloceanspaces.com/images/portfolio-profile.jpg",
  ...projects.flatMap((project) => project.screenshots?.map((shot) => shot.src) ?? []),
];

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function preloadImages(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<void> {
  if (urls.length === 0) return Promise.resolve();
  let loaded = 0;
  return Promise.all(
    urls.map((url) =>
      preloadImage(url).then(() => {
        loaded++;
        onProgress?.(loaded, urls.length);
      })
    )
  ).then(() => undefined);
}

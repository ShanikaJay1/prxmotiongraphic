import { staticFile } from "remotion";
import manifest from "./generated/asset-manifest.json";

const files = new Set<string>(manifest.files);

export const hasAsset = (path: string) => files.has(path);

// First candidate that exists in assets/, else null (callers show a placeholder).
export const resolveAsset = (...candidates: string[]) => {
  const found = candidates.find(hasAsset);
  return found ? { path: found, src: staticFile(found) } : null;
};

export const merchantLogo = (slug: string) =>
  resolveAsset(`merchants/${slug}.svg`, `merchants/${slug}.png`);

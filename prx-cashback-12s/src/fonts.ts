// Self-hosted brand fonts (Manrope, Momo Trust Display), loaded before the
// first frame renders so every frame is identical on every render.
import { continueRender, delayRender, staticFile } from 'remotion';

const FACES: Array<[family: string, file: string, weight: string]> = [
  ['Manrope', 'fonts/manrope-latin-400-normal.woff2', '400'],
  ['Manrope', 'fonts/manrope-latin-700-normal.woff2', '700'],
  ['Manrope', 'fonts/manrope-latin-800-normal.woff2', '800'],
  ['Momo Trust Display', 'fonts/momo-trust-display-latin-400-normal.woff2', '400'],
];

const handle = delayRender('Loading brand fonts');
Promise.all(
  FACES.map(async ([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight });
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });

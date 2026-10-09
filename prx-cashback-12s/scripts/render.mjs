// Renders the PRX Cashback 12s ad.
//   node scripts/render.mjs            export mp4 + draft mp4 (with overlay + zone QA) + frame-000.png
//   node scripts/render.mjs --draft-only   draft mp4 + zone QA only
//   node scripts/render.mjs --stills 0,74,140,262,330   draft PNG stills into out/stills/
// Set BROWSER=/path/to/chrome-headless-shell to choose the browser; by
// default the preinstalled Playwright headless shell is used if present,
// otherwise Remotion downloads its own.
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runZoneQa } from './zones.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
const ID = 'PrxCashback12s';
const PW_SHELL = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.BROWSER || (existsSync(PW_SHELL) ? PW_SHELL : null);

const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const draftOnly = args.includes('--draft-only');

mkdirSync(OUT, { recursive: true });
console.log('Bundling…');
const serveUrl = await bundle({ entryPoint: join(ROOT, 'src/index.ts') });

const comp = (inputProps) => selectComposition({ serveUrl, id: ID, inputProps, browserExecutable });
const common = { serveUrl, browserExecutable, chromiumOptions: { gl: 'swiftshader' }, logLevel: 'error' };
// PNG frames + BT.709 give a standard limited-range yuv420p H.264 file.
const video = { codec: 'h264', imageFormat: 'png', pixelFormat: 'yuv420p', colorSpace: 'bt709' };

if (stillsArg) {
  const inputProps = { draft: true, qa: false };
  const composition = await comp(inputProps);
  mkdirSync(join(OUT, 'stills'), { recursive: true });
  for (const frame of stillsArg.split(',').map(Number)) {
    const output = join(OUT, 'stills', `draft-${String(frame).padStart(3, '0')}.png`);
    await renderStill({ ...common, composition, frame, inputProps, output });
    console.log('still', output);
  }
  process.exit(0);
}

// 1. Export: no overlay.
if (!draftOnly) {
  const inputProps = { draft: false, qa: false };
  const composition = await comp(inputProps);
  await renderMedia({
    ...common,
    composition,
    inputProps,
    ...video,
    crf: 16,
    x264Preset: 'slow',
    outputLocation: join(OUT, 'prx-cashback-12s.mp4'),
    onProgress: ({ renderedFrames }) => renderedFrames % 60 === 0 && console.log(`export ${renderedFrames}/360`),
  });
  await renderStill({ ...common, composition, frame: 0, inputProps, output: join(OUT, 'frame-000.png') });
  console.log('wrote prx-cashback-12s.mp4, frame-000.png');
}

// 2. Draft: overlay on, QA probe logs every [data-zone] rect per frame.
{
  const inputProps = { draft: true, qa: true };
  const composition = await comp(inputProps);
  const frames = new Map();
  await renderMedia({
    ...common,
    composition,
    inputProps,
    ...video,
    crf: 20,
    outputLocation: join(OUT, 'prx-cashback-12s-draft.mp4'),
    onBrowserLog: ({ text }) => {
      if (!text.startsWith('QA|')) return;
      const [, frame, json] = text.match(/^QA\|(\d+)\|(.*)$/s);
      frames.set(Number(frame), JSON.parse(json));
    },
    onProgress: ({ renderedFrames }) => renderedFrames % 60 === 0 && console.log(`draft ${renderedFrames}/360`),
  });
  console.log('wrote prx-cashback-12s-draft.mp4');

  const sorted = Object.fromEntries([...frames].sort((a, b) => a[0] - b[0]));
  writeFileSync(join(OUT, 'qa-frames.json'), JSON.stringify(sorted));
  process.exitCode = runZoneQa(sorted, OUT);
}

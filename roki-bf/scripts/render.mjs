// Renders index.html frame by frame (24 fps, no motion blur: the look is stepped).
// Usage:
//   node scripts/render.mjs                         -> out/roki-bf-wraps-silent.mp4
//   node scripts/render.mjs --stills 0.6,3.2,7.8    -> out/still-<t>.png
//   node scripts/render.mjs --beats                 -> out/beats.png (one frame per beat)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { spawn, execSync } from 'node:child_process';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(execSync('npm root -g').toString().trim() + '/playwright')); }

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const flag = n => args.indexOf(n);
const stills = flag('--stills') >= 0 ? args[flag('--stills') + 1].split(',').map(Number) : null;
const beats = flag('--beats') >= 0;
const out = join(ROOT, 'out/roki-bf-wraps-silent.mp4');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) throw new Error('outside root');
    const body = await readFile(p.endsWith('/') ? join(p, 'index.html') : p);
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--disable-threaded-animation'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/index.html?export`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.ready === true);
const { TOTAL, FPS, BPM } = await page.evaluate(() => window.ROKI);
const stage = await page.$('#stage');
const shot = async (t, opts = {}) => {
  await page.evaluate(t => { seek(t); return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); }, t);
  return stage.screenshot({ type: 'png', ...opts });
};

if (stills) {
  for (const t of stills) { await shot(t, { path: join(ROOT, `out/still-${t}.png`) }); console.log('still', t); }
} else if (beats) {
  const n = Math.floor(TOTAL * BPM / 60);
  for (let i = 0; i < n; i++) await shot(i * 60 / BPM + 0.25, { path: join(ROOT, `out/beat-${String(i).padStart(2, '0')}.png`) });
  execSync(`${FFMPEG} -y -loglevel error -pattern_type glob -i '${ROOT}/out/beat-*.png' -vf "scale=270:-1,tile=5x5" -frames:v 1 ${ROOT}/out/beats.png`);
  execSync(`rm ${ROOT}/out/beat-*.png`);
  console.log('wrote out/beats.png');
} else {
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p',
    '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(TOTAL * FPS);
  for (let f = 0; f < frames; f++) {
    const buf = await shot(f / FPS);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 48 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();

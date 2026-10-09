// Renders index.html to an MP4 by seeking the timeline frame-by-frame.
// Usage: node scripts/render.mjs [out.mp4] [--page brands.html] [--stills 1,5.5,12]
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
const flag = name => { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : null; };
const stillsArg = flag('--stills');
const stills = stillsArg ? stillsArg.split(',').map(Number) : null;
const PAGE = flag('--page') || 'index.html';
const STEM = PAGE === 'index.html' ? 'prx-vault-promo' : 'prx-' + PAGE.replace(/\.html$/, '');
const out = args[0] || join(ROOT, `out/${STEM}.mp4`);
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT)) throw new Error('outside root');
    const body = await readFile(p.endsWith('/') ? join(p, 'index.html') : p);
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(`http://127.0.0.1:${port}/${PAGE}?export`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const { TOTAL, FPS } = await page.evaluate(() => ({ TOTAL: PRX_TIMELINE.TOTAL, FPS: PRX_TIMELINE.FPS }));
const stage = await page.$('#stage');

if (stills) {
  for (const t of stills) {
    await page.evaluate(t => seek(t), t);
    await stage.screenshot({ path: join(ROOT, `out/${STEM}-still-${t}.png`) });
    console.log('still', t);
  }
} else {
  const ff = spawn(FFMPEG, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(TOTAL * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(t => seek(t), f / FPS);
    const buf = await stage.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 60 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();

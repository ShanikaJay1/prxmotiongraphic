import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Zone checks for the ad variant (mirror of src/layout.ts ZONES).
export const ZONES = {
  adText: { x: 65, y: 270, w: 785, h: 980 },
  visual: { x: 60, y: 240, w: 960, h: 1440 },
  rail: { x: 850, y: 1152, w: 230, h: 768 },
};
/** An element counts as readable/visible above this effective opacity. */
export const VISIBLE = 0.3;
const EPS = 0.5;

const inside = (r, z) => r.x >= z.x - EPS && r.y >= z.y - EPS && r.x + r.w <= z.x + z.w + EPS && r.y + r.h <= z.y + z.h + EPS;
const intersects = (r, z) => r.x < z.x + z.w && r.x + r.w > z.x && r.y < z.y + z.h && r.y + r.h > z.y;

export function checkFrame(frame, items) {
  const out = [];
  for (const it of items) {
    if (![it.x, it.y, it.w, it.h].every(Number.isFinite)) {
      if (it.opacity >= VISIBLE) out.push({ frame, problem: 'unmeasurable rect', label: it.label, opacity: it.opacity });
      continue;
    }
    if (it.opacity < VISIBLE || it.w === 0) continue;
    const zone = it.zone === 'text' ? ZONES.adText : ZONES.visual;
    const r = { x: +it.x.toFixed(1), y: +it.y.toFixed(1), w: +it.w.toFixed(1), h: +it.h.toFixed(1) };
    if (!inside(it, zone)) out.push({ frame, problem: `outside ${it.zone === 'text' ? 'ad text safe' : 'visual safe'}`, label: it.label, opacity: it.opacity, rect: r });
    if (intersects(it, ZONES.rail)) out.push({ frame, problem: 'in rail zone', label: it.label, opacity: it.opacity, rect: r });
  }
  return out;
}

/** Checks every frame, writes out/qa-zones.json, returns a process exit code. */
export function runZoneQa(frames, outDir) {
  const failures = [];
  for (const [frame, items] of Object.entries(frames)) failures.push(...checkFrame(Number(frame), items));
  const count = Object.keys(frames).length;
  writeFileSync(join(outDir, 'qa-zones.json'), JSON.stringify({ zones: ZONES, visibleAbove: VISIBLE, framesChecked: count, failures }, null, 2));
  console.log(`zone QA: ${count} frames checked, ${failures.length} failures (out/qa-zones.json)`);
  if (count !== 360) console.log('WARNING: expected 360 QA frames');
  if (failures.length) console.log(failures.slice(0, 20));
  return failures.length || count !== 360 ? 1 : 0;
}

// node scripts/zones.mjs  re-checks out/qa-frames.json without re-rendering.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'out');
  process.exitCode = runZoneQa(JSON.parse(readFileSync(join(outDir, 'qa-frames.json'), 'utf8')), outDir);
}

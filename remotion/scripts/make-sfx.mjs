// Synthesises the UI sound effects into assets/audio/sfx/ (no samples, nothing
// to license). Deterministic: the same code always writes the same files.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "../assets/audio/sfx");
const SR = 48000;

const wav = (samples) => {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((s, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), 44 + i * 2));
  return buf;
};

const render = (seconds, fn) => {
  const n = Math.round(seconds * SR);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) out[i] = fn(i / SR, (dp) => (phase += dp / SR));
  const peak = Math.max(...out.map(Math.abs));
  return Array.from(out, (s) => (s / peak) * 0.89);
};

// Soft pop: a sine that drops in pitch, with a fast attack and short decay.
const pop = render(0.12, (t, adv) => {
  const f = 340 + 520 * Math.exp(-t * 40);
  const env = Math.min(1, t / 0.002) * Math.exp(-t * 38);
  const p = adv(f);
  return env * (Math.sin(2 * Math.PI * p) + 0.25 * Math.sin(4 * Math.PI * p));
});

// Tick: a very short high click with a little body.
const tick = render(0.05, (t, adv) => {
  const env = Math.min(1, t / 0.0008) * Math.exp(-t * 120);
  const p = adv(2400);
  return env * (Math.sin(2 * Math.PI * p) + 0.4 * Math.sin(2 * Math.PI * p * 0.5));
});

// Chime: two bell partials a fifth apart (A5, E6) with slow decay.
const chime = render(1.4, (t) => {
  const env = Math.min(1, t / 0.004);
  const bell = (f, d, a) => a * Math.exp(-t * d) * Math.sin(2 * Math.PI * f * t);
  return env * (bell(880, 3.2, 1) + bell(1318.5, 4.5, 0.6) + bell(2640, 9, 0.18) + bell(1760, 6, 0.25 * Math.min(1, Math.max(0, (t - 0.09) / 0.004))));
});

mkdirSync(OUT, { recursive: true });
for (const [name, s] of Object.entries({ pop, tick, chime })) writeFileSync(join(OUT, `${name}.wav`), wav(s));
console.log("sfx written to", OUT);

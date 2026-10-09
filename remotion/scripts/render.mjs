// Bundles once, then renders review stills and/or every video variant.
//
//   node scripts/render.mjs stills   # middle frame of every scene, safe zones on
//   node scripts/render.mjs videos   # 20s master, 15s cutdown, one 20s per hook
//   node scripts/render.mjs all
//
// Set REMOTION_BROWSER to a local Chrome/Chromium headless shell to skip
// Remotion's browser download.
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const mode = process.argv[2] ?? "all";
const { hookVariants, cuts } = await import(join(ROOT, "src/config.ts"));

const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({
  entryPoint: join(ROOT, "src/index.ts"),
  publicDir: join(ROOT, "assets"),
  outDir: join(ROOT, ".remotion-bundle"),
});

const base = { cut: "master20", hookVariant: null, showSafeZones: false, muteSfx: false };
const composition = async (id, inputProps) =>
  selectComposition({ serveUrl, id, inputProps, browserExecutable });

// Mirror of src/timeline.ts (no bpm snapping needed for still frame picks).
const scenesOf = (cut) =>
  cuts[cut].scenes.map((s, i, all) => {
    const next = i + 1 < all.length ? all[i + 1].start : cuts[cut].durationInFrames;
    return { ...s, length: next - s.start };
  });

if (mode === "stills" || mode === "all") {
  const dir = join(OUT, "stills");
  mkdirSync(dir, { recursive: true });
  const jobs = [];
  for (const cut of ["master20", "cutdown15"]) {
    scenesOf(cut).forEach((s, i) => {
      jobs.push({ name: `${cut === "master20" ? "20s" : "15s"}-${i + 1}-${s.id}`, cut, frame: s.start + Math.floor(s.length / 2) });
    });
  }
  // Frame 0 (cover), the final held frame, and the alternatives behind config switches.
  const extra = [
    { name: "20s-cover-frame0", cut: "master20", frame: 0 },
    { name: "20s-final-frame", cut: "master20", frame: cuts.master20.durationInFrames - 1 },
    { name: "alt-phone-frame", cut: "master20", frame: 360 + 100, props: { uiFrame: "phone" } },
    { name: "alt-grid-wall", cut: "master20", frame: 195 + 60, props: { brandWall: "grid" } },
    ...hookVariants.map((_, i) => ({ name: `hook-${i + 1}`, cut: "master20", frame: 30, props: { hookVariant: i + 1 } })),
  ];
  for (const job of [...jobs, ...extra]) {
    const inputProps = { ...base, cut: job.cut, showSafeZones: true, ...(job.props ?? {}) };
    const id = job.cut === "master20" ? "PRX-Master-20s" : "PRX-Cutdown-15s";
    const comp = await composition(id, inputProps);
    const output = join(dir, `${job.name}-f${job.frame}.png`);
    await renderStill({ serveUrl, composition: comp, frame: job.frame, output, inputProps, browserExecutable, overwrite: true });
    console.log("still", output);
  }
}

if (mode === "videos" || mode === "all") {
  mkdirSync(OUT, { recursive: true });
  const jobs = [
    { file: "prx-vault-20s.mp4", id: "PRX-Master-20s", props: {} },
    { file: "prx-vault-15s.mp4", id: "PRX-Cutdown-15s", props: { cut: "cutdown15" } },
    ...hookVariants.map((_, i) => ({ file: `prx-vault-20s-hook-${i + 1}.mp4`, id: "PRX-Master-20s", props: { hookVariant: i + 1 } })),
  ];
  for (const job of jobs) {
    const inputProps = { ...base, ...job.props };
    const comp = await composition(job.id, inputProps);
    const outputLocation = join(OUT, job.file);
    await renderMedia({
      serveUrl,
      composition: comp,
      inputProps,
      codec: "h264",
      pixelFormat: "yuv420p",
      colorSpace: "bt709", // limited-range yuv420p, tagged BT.709, as platforms expect
      audioCodec: "aac",
      enforceAudioTrack: true, // silent AAC track when there is no audio
      crf: 20,
      x264Preset: "slow",
      imageFormat: "jpeg",
      jpegQuality: 95,
      outputLocation,
      browserExecutable,
      overwrite: true,
      onProgress: ({ progress }) => process.stdout.write(`\r${job.file} ${Math.round(progress * 100)}%`),
    });
    const mb = statSync(outputLocation).size / 1e6;
    console.log(`\n${job.file}: ${mb.toFixed(1)} MB${mb > 15 ? " (over the 15 MB target: raise crf)" : ""}`);
  }
}

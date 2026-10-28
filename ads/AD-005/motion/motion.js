// AD-005 motion layer. Pure seek(t): every frame is computed from t alone, no timers, no state.
// Paper-grunge timing: 24 fps, stepped (held) frames, stamp entrances, panels cut in on twos.
(() => {
const FPS = 24, DUR = 14;
// re-paced to the song: 87.5 BPM, one beat = 0.6857 s; film beat 0 = song 18.514 s, FREE lands on the drop (beat 13)
const B = 60 / 87.5;
const frame = t => Math.floor(t * FPS + 1e-6);
const held = (t, n) => Math.floor(frame(t) / n);
const onF = t => Math.ceil(t * FPS - 1e-6);      // first frame on which a cue at time t is visible
function rnd(seed){ let s = seed >>> 0; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822519) + 0x9e3779b9 >>> 0) / 4294967296); }

// scene windows (s): hook, showcase, value, close
const SC = [["#s1", 0, 3 * B], ["#s2", 3 * B, 9 * B], ["#s3", 9 * B, 16 * B], ["#s4", 16 * B, 14.0]];
const $ = (q, r = document) => r.querySelector(q), $$ = (q, r = document) => [...r.querySelectorAll(q)];

// split the two-line headlines into lines so each line can stamp on its own
$$(".hx").forEach(h => {
  const parts = h.innerHTML.split(/<br\s*\/?>/i);
  h.innerHTML = parts.map(p => `<span class="ln" style="display:block">${p}</span>`).join("");
});
$$(".acc").forEach(a => a.style.display = "inline-block");

const S1 = $("#s1"), S2 = $("#s2"), S3 = $("#s3"), S4 = $("#s4");
const tracks = [];            // {el, t, fx, ...}
const add = (el, t, fx, o = {}) => el && tracks.push(Object.assign({ el, t, fx }, o));

// 1 · Hook
{ const mk = $$(".mk", S1), ph = $$(".ph", S1), tape = $$(".tape", S1), ln = $$(".hx .ln", S1);
  add(mk[0], 0, "on"); add(mk[1], 0.125 * B, "stamp");
  ph.forEach((e, i) => add(e, i * 0.25 * B, "stamp"));
  tape.forEach((e, i) => add(e, 0.75 * B + i * 0.125 * B, "cut"));
  add(ln[0], 1 * B, "stamp"); add(ln[1], 1.5 * B, "stamp"); add($(".acc", S1), 2 * B, "pop"); }

// 2 · Showcase: panels cut in on twos, captions stamp, slow stepped push-in
{ const pn = $$(".pn", S2), poly = $$("svg.strokes polygon", S2), cb = $$(".cbox", S2);
  pn.forEach((e, i) => { const t = (3 + i * 0.5) * B; add(e, t, "cut"); add(poly[i], t, "cut"); add(cb[i], t + 0.25 * B, "stamp");
    add($("img", e), t, "push", { end: 9 * B, amt: 0.05 }); }); }

// 3 · Value: slices cut in on the half beat with their name captions, then PAID x3 and FREE
{ const mk = $$(".mk", S3), pn = $$(".pn", S3), poly = $$("svg.strokes polygon", S3), nm = $$(".cbox", S3), sfx = $$("svg.sfx", S3);
  add(mk[0], 9 * B, "on");
  pn.forEach((e, i) => { const t = (9 + i * 0.5) * B; add(e, t, "cut"); add(poly[i], t, "cut"); add(nm[i], t + 0.25 * B, "stamp");
    add($("img", e), t, "push", { end: 16 * B, amt: 0.04 }); });
  sfx.forEach((e, i) => add(e, [11.5, 12, 12.5, 13][i] * B, "stamp", { big: i === 3 })); }
const HIT = 13 * B;              // FREE lands: impact frame + shake

// 4 · Close
{ const brush = $("img.abs", S4), pn = $(".pn", S4), poly = $("svg.strokes polygon", S4);
  add(brush, 16 * B, "wipe", { steps: 6, dur: 0.25 });
  add(pn, 16.5 * B, "cut"); add(poly, 16.5 * B, "cut"); add($("img", pn), 16.5 * B, "push", { end: 14, amt: 0.06 });
  add($(".offer", S4), 17 * B, "stamp"); add($(".cap", S4), 17.5 * B, "cut"); add($(".bar", S4), 18 * B, "stamp"); }

// stamp curve: 1.12 → 1.0 over 3 frames (held), FREE overshoots harder
const STAMP = [1.12, 1.06, 1.02], STAMP_BIG = [1.3, 1.15, 1.05, 1.01];

const rough = ["#rough feTurbulence", "#roughS feTurbulence"].map(q => $(q));
const grainT = $("#grain feTurbulence");
const shakeRnd = (f) => { const r = rnd(9000 + f); return [(r() - .5) * 2, (r() - .5) * 2]; };

window.seek = async (t) => {
  t = Math.max(0, Math.min(DUR - 1e-6, t));
  const f = frame(t);
  // scenes: hard cuts
  SC.forEach(([q, a, b]) => { $(q).style.visibility = (t >= a && t < b) ? "visible" : "hidden"; });
  // tracks
  for (const k of tracks) {
    const dt = t - k.t, df = frame(t) - onF(k.t), el = k.el, isSvg = el instanceof SVGElement && el.tagName !== "svg";
    const show = dt >= -1e-6;
    if (isSvg) { el.setAttribute("visibility", show ? "visible" : "hidden"); continue; }
    if (k.fx === "push") { const p = Math.min(1, Math.max(0, (held(t, 4) * 4 / FPS - k.t) / (k.end - k.t)));
      el.style.scale = String(1 + k.amt * p); continue; }
    el.style.visibility = show ? "inherit" : "hidden";
    if (!show) continue;
    if (k.fx === "stamp") { const c = k.big ? STAMP_BIG : STAMP; el.style.scale = String(df < c.length ? c[df] : 1); }
    else if (k.fx === "pop") { el.style.scale = String(df < 4 ? [1.35, 1.2, 1.08, 1.02][df] : 1); }
    else if (k.fx === "wipe") { const p = Math.min(1, Math.floor(Math.max(0, dt) / k.dur * k.steps + 1) / k.steps);
      el.style.clipPath = `inset(-20% ${((1 - p) * 100).toFixed(1)}% -20% 0)`; }
  }
  // paper jolt on each scene's first 2 frames, FREE impact shake (held on twos, decays over 8 frames)
  for (const [q, a] of SC) { const s = $(q), fa = f - onF(a); let x = 0, y = 0;
    if (fa >= 0 && fa < 2) { const [jx, jy] = shakeRnd(onF(a)); x = jx * 6; y = jy * 6; }
    if (q === "#s3") { const fh = f - onF(HIT); if (fh >= 0 && fh < 8) { const [sx, sy] = shakeRnd(onF(HIT) + (fh >> 1)); const amp = 14 * (1 - fh / 8); x += sx * amp; y += sy * amp; } }
    s.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`; }
  S3.style.filter = (f === onF(HIT)) ? "invert(1)" : "none";
  // textures: paper breathes on fours, ink edges boil on fours, grain crawls on twos
  const ph = held(t, 4), pr = rnd(500 + (ph % 12));
  document.querySelectorAll(".screen:not(.dark)").forEach(s => s.style.backgroundPosition = `${Math.round((pr() - .5) * 8)}px ${Math.round((pr() - .5) * 8)}px`);
  rough.forEach((r, i) => r && r.setAttribute("seed", String(3 + i * 4 + (ph % 3))));
  grainT.setAttribute("seed", String(1 + held(t, 2) % 40));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
};

// preview controls (playback only, the render never uses this clock): Space play/pause, ←/→ frame, R replay
let playing = false, t0 = 0, start = 0;
const hud = document.createElement("div");
hud.style.cssText = "position:fixed;left:8px;top:8px;z-index:99;font:12px monospace;color:#fff;background:rgba(0,0,0,.6);padding:4px 8px;display:none";
document.body.appendChild(hud);
let cur = 0;
const show = async (t) => { cur = t; await window.seek(t); hud.textContent = `${t.toFixed(2)}s  f${frame(t)}`; };
function loop(now){ if (!playing) return; const t = t0 + (now - start) / 1000; if (t >= DUR) { playing = false; return; } show(t).then(() => requestAnimationFrame(loop)); }
addEventListener("keydown", e => {
  hud.style.display = "block";
  if (e.code === "Space") { playing = !playing; if (playing) { t0 = cur; start = performance.now(); requestAnimationFrame(loop); } }
  if (e.code === "ArrowRight") { playing = false; show(Math.min(DUR, cur + 1 / FPS)); }
  if (e.code === "ArrowLeft") { playing = false; show(Math.max(0, cur - 1 / FPS)); }
  if (e.code === "KeyR") { playing = true; t0 = 0; start = performance.now(); requestAnimationFrame(loop); }
});
Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(() => {}))]).then(async () => { await window.seek(0); window.ready = true; });
})();

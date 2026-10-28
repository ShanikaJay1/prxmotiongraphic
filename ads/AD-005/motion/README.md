# AD-005 · motion (approved)

Story 1080×1920, 24 fps, 14 s, built on the approved layout in `../layout/`.

Re-paced to the song at the Sound stage (87.5 BPM, beat B = 0.6857 s): scene cuts at 3B, 9B and 16B, and every entrance on a half or quarter beat. FREE lands at 13B (8.91 s).

| Scene | Time (before re-pace) | Motion |
| --- | --- | --- |
| 1 · Hook | 0–2 s | photos stamp in staggered, tape cuts on, headline stamps line by line, "3." punch |
| 2 · Showcase | 2–6.5 s | five panels cut in on twos, captions stamp, stepped push-in |
| 3 · Value | 6.5–10.5 s | slices cut in on the half beat with name captions (revised 28 Oct: price headline and brush bar removed), PAID ×3, FREE hit (1-frame impact + shake) |
| 4 · Close | 10.5–14 s | brush 頂点へ wipes, splash panel cuts in with push, offer, dates, CTA stamp |

- `AD-005-motion.html` + `motion.js`: deterministic `window.seek(t)` engine (no timers). Preview keys: Space play/pause, ←/→ frame step, R replay.
- `render.js`: Playwright frame capture. Serve `ads/AD-005/` over HTTP on port 8766 (fonts in `../layout/fonts/`, see the layout README), then `node render.js <outdir> 0 335`.
- `AD-005-motion-draft.mp4`: the draft approved at Motion (silent, before the re-pace). The current cut with sound is `../sound/AD-005-sound-preview.mp4`. The final render is made at Render and Export.

# AD-005 · motion (approved)

Story 1080×1920, 24 fps, 14 s, built on the approved layout in `../layout/`.

| Scene | Time | Motion |
| --- | --- | --- |
| 1 · Hook | 0–2 s | photos stamp in staggered, tape cuts on, headline stamps line by line, "3." punch |
| 2 · Showcase | 2–6.5 s | five panels cut in on twos, captions stamp, stepped push-in |
| 3 · Value | 6.5–10.5 s | headline stamps, red brush bar wipes, slices cut in, PAID ×3, FREE hit at 9.0 s (1-frame impact + shake) |
| 4 · Close | 10.5–14 s | brush 頂点へ wipes, splash panel cuts in with push, offer, dates, CTA stamp |

- `AD-005-motion.html` + `motion.js`: deterministic `window.seek(t)` engine (no timers). Preview keys: Space play/pause, ←/→ frame step, R replay.
- `render.js`: Playwright frame capture. Serve `ads/AD-005/` over HTTP on port 8766 (fonts in `../layout/fonts/`, see the layout README), then `node render.js <outdir> 0 335`.
- `AD-005-motion-draft.mp4`: approved draft preview, silent. The final render is made at Render and Export.

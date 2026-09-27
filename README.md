# PRX Vault: Promo Motion Graphic

A 29-second, 1080×1920 promo for PRX Vault. It is built as a seekable HTML timeline using the PRX design system: its tokens, fonts, 3D assets, merchant banners and `prx-motion.css` easing and durations.

- `index.html`: the animation. Open it in a browser to preview (it loops).
- `scripts/render.mjs`: exports the video frame by frame through headless Chromium and ffmpeg.
- `scripts/sound.py`: procedural sound design, synthesised in numpy and synced to the same scene constants.
- `out/prx-vault-promo.mp4`: the final video with sound (−14 LUFS, ready for social).
- `out/prx-vault-promo-silent.mp4` and `out/prx-vault-sound.wav`: separate picture and audio, for editors or for laying your own track or voiceover over the top.
- `COPY.md`: launch copy (headlines, script, captions, store listing, Product Hunt).
- `assets/`: the brand, 3D, merchant and font files from the PRX design system, plus the app screen exports.

## Re-render

```bash
npx http-server .            # preview at http://localhost:8080
node scripts/render.mjs out/prx-vault-promo.mp4          # needs ffmpeg with libx264
node scripts/render.mjs --stills 3,12,20.9               # PNG stills into out/
pip install numpy scipy && python3 scripts/sound.py out/prx-vault-sound.wav   # rebuild audio
```

All timings are named constants at the top of the `<script>` in `index.html`: scene start times `S1`–`S6`, plus `DUR`, `STAGGER`, `HOLD` and `TRAVEL`.

## Sound design

Everything is synthesised; there are no samples and no licensing to clear. It follows the brief: premium and controlled, with no coin sounds or reward jingles.

| Time | Cue |
| --- | --- |
| Bed | A D-major ambient pad, one chord per scene. It strips back for "No codes…" and resolves on the end card. |
| 4–21.5s | A soft 100 bpm pulse (plus a quiet shaker from Step 02) carries the three steps. |
| 0.5s | A low bloom as the vault mark lands. |
| Scene cuts | A filtered-air whoosh peaking on each cut. |
| 8.5s | A **vault latch** (thunk plus bolt click) as the card seats into "Add Card". |
| 12.5s, 14.4s | Swipes as the offer carousel moves. |
| 18.8s | **Cashback confirmed**: a restrained rising fourth (A5 → D6), then a soft settle as the wallet total lands. |
| 21.6–22.5s | Three muted hits on "No codes. No receipts. No gimmicks." |
| 25s | A swell into the end card, then a warm hit and a D-major bell resolve. |

The hits carry upper harmonics so they still read on phone speakers.

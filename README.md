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

---

# Brand Scroll: Short-Form Video

A 21.6-second, 1080×1920 short (`brands.html`) that shows which brands are on PRX Vault and ends on a sign-up CTA. It uses the same toolchain as the promo.

- `out/prx-brands.mp4`: the final video with sound (−14 LUFS). `out/prx-brands-silent.mp4` and `out/prx-brands-sound.wav` are the picture and audio separately.
- `scripts/sound_brands.py`: its sound design. Each tile that scrolls past the top of the feed gets its own soft detent tick, computed from the same flick curve as the picture.

| Time | Beat |
| --- | --- |
| 0–2s | Hook (on the cover frame): "You already shop here. Where's your cashback?", framed by merchant banners |
| 2–10.9s | The app's "Our Offers" feed scrolls in flicks that speed up, through 20 brands. The category chip follows the feed. Headers: "Your go-to brands. Now with cashback." → "Big names. Real cashback." |
| 10.9–14.2s | Brand wall: four columns of every banner. "Fashion. Sport. Beauty. All in one app." |
| 14.2–17.4s | 1 Sign up and link your card · 2 Shop like you always do · 3 Get cashback |
| 17.4–21.6s | Lockup, "Start earning.", "Sign up now" (tapped), brand strip |

```bash
node scripts/render.mjs out/prx-brands-silent.mp4 --page brands.html
python3 scripts/sound_brands.py out/prx-brands-sound.wav
ffmpeg -i out/prx-brands-silent.mp4 -i out/prx-brands-sound.wav -map 0:v -map 1:a -c:v copy \
  -af loudnorm=I=-14:TP=-1:LRA=11 -c:a aac -b:a 192k -shortest -movflags +faststart out/prx-brands.mp4
```

Brands, categories and offer values all live in the `BRANDS` array at the top of the `<script>` in `brands.html`. Timings live in `S1`–`S5`, `FLICKS` and `H*_AT`, and `scripts/sound_brands.py` mirrors them.

**Before publishing**

- Offer values flagged `sample: true` are placeholders. Only Swarovski (~$4), New Balance (~$6) and Princess Polly (~$4) come from the app's own feed export. Swap in live values.
- Online and In-store tags are assumed, except for New Balance, which has both in the app export.
- Merchant logos are third-party marks, so confirm you have permission to use them in paid or organic video (`asset-usage` §5).
- JD Sports is in the design system, but its banner file has no image data, so it is left out. Re-export it and add one line to `BRANDS`.
- The screen is the flat app UI with no device frame or bezel, so the "no phone mockup" rule holds.
- The copy uses "earn" and "Start earning.", which the brand book's voice rules now allow (it overrides the older "confirmed-only" copy ban in `COPY.md`).

# PRX Vault: Promo Motion Graphic

A 29-second, 1080×1920 promo for PRX Vault. It is built as a seekable HTML timeline using the PRX design system: its tokens, fonts, 3D assets, merchant banners and `prx-motion.css` easing and durations.

- `index.html`: the animation. Open it in a browser to preview (it loops).
- `scripts/render.mjs`: exports the video frame by frame through headless Chromium and ffmpeg.
- `out/prx-vault-promo.mp4`: the rendered video.
- `COPY.md`: launch copy (headlines, script, captions, store listing, Product Hunt).
- `assets/`: the brand, 3D, merchant and font files from the PRX design system, plus the app screen exports.

## Re-render

```bash
npx http-server .            # preview at http://localhost:8080
node scripts/render.mjs out/prx-vault-promo.mp4          # needs ffmpeg with libx264
node scripts/render.mjs --stills 3,12,20.9               # PNG stills into out/
```

All timings are named constants at the top of the `<script>` in `index.html`: scene start times `S1`–`S6`, plus `DUR`, `STAGGER`, `HOLD` and `TRAVEL`.

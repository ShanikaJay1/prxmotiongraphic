# Roki: The Grappler Hand Wraps, 4:5 Instagram ad

A 12.5-second, 1080×1350 feed ad for **The Grappler Hand Wraps**, in Roki's manga look (paper, ink, one red), built as a seekable HTML timeline. It uses the Roki design system for tokens, fonts, logos, product photography and manga art. The look is a stepped paper-grunge style: 24 fps, no motion blur, textures held on twos and fours.

- `index.html`: the animation. Serve the folder and open it to preview. Space plays and pauses, ←/→ step one frame, R replays.
- `out/roki-grappler-ad.mp4`: the final ad with sound (H.264 BT.709, AAC 256k, −14 LUFS).
- `out/roki-grappler-silent.mp4` and `out/roki-sound.wav`: picture and sound as separate files.
- `scripts/render.mjs`: frame-by-frame export through headless Chromium and ffmpeg.
- `scripts/sound.py`: procedural sound (numpy/scipy), cued from the same constants as the picture.
- `scripts/assetgen.py`: the paper-grunge asset generator (pack seed 7). `scripts/cutout_rolls.py`: the product cut-out.

## Beat map (120 BPM, one beat = 0.5 s = 12 frames)

| Time | Scene | What happens |
| --- | --- | --- |
| 0.0 | Hook (paper) | Kicker "MADE FOR THE STRIKERS" and the `manga-jab` panel, stepped push-in |
| 0.5 / 1.0 / 1.5 | | "NO QUIT." "NO FRAY." "NO SLIP." stamp on the beats, with shake. "NO SLIP." in RokiRed |
| 2.5 | Product (paper) | 2-frame impact flash, hard cut. The wraps (Tier A cut-out, sticker outline, hard ink shadow) over an ink spike burst |
| 3.0 / 3.5 | | Headline "THE GRAPPLER HAND WRAPS", then "Cotton-elastic blend. Second-skin compression." |
| 5.5 | Proof (paper) | Ink brush-band wipe. Manga panels: model shot with the house halftone finish, plus a flat-lay detail of the thumb loop and patch |
| 6.5 / 7.0 / 7.5 | | Numbered proof callouts: 4.5M LENGTH, REINFORCED THUMB LOOP, EXTRA-WIDE VELCRO |
| 9.0 | End card (ink) | Wipe to the dark fist shot with a torn ink edge |
| 9.5 to 11.0 | | "READY FOR ROUND ONE?" (signal-red), "START YOUR TRAINING ARC", "The Grappler Hand Wraps. A$29.99.", "SHOP NOW" |
| 11.0 to 12.5 | | Final hit, held end card (ink boil and grain stay alive) |

## Facts on screen

Every claim comes from the live Shopify listing for The Grappler Hand Wraps (checked 23 Oct 2026): "No quit. No fray.", "no fray, no slip", the cotton-elastic blend and second-skin compression, the reinforced thumb loop, the extra-wide Velcro closure, the 4.5m variant (the only one in stock; 5.0m is sold out) and the A$29.99 price. If the price or stock changes, edit the `s4` body line in `index.html`.

## Brand rules followed

- Druk Wide headlines, Anime Ace kickers and callouts, Poppins body and CTA. Square corners, 60px margins, first headline line at 96px.
- One accent per layout: RokiRed on paper, signal-red for the kicker on ink. No yellow, no emoji, no exclamation marks.
- Logos are the supplied files, never filtered. Wordmark bottom-left, 頂点へ bottom-right on paper and top-right on ink. Black on paper, white on ink.
- The product photo is never textured. Grain sits under it apart from a 6% top layer; halftone goes only on the model shots.

## Re-render

```bash
node scripts/render.mjs --stills 2.2,4.5,8.2,12.3   # PNG stills into out/
node scripts/render.mjs --beats                     # one frame per beat -> out/beats.png
node scripts/render.mjs                             # out/roki-grappler-silent.mp4
python3 scripts/sound.py out/roki-sound-raw.wav     # then loudnorm to -14 LUFS and mux (see below)
ffmpeg -i out/roki-grappler-silent.mp4 -i out/roki-sound.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart out/roki-grappler-ad.mp4
```

The sound is normalised with a two-pass `loudnorm` (I=−14, TP=−1.3).

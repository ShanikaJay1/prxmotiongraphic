# Roki: Black Friday hand wraps catalogue ad (4:5)

A 13.5-second, 1080×1350 Instagram feed ad for Roki's Black Friday sale, built around the hand wraps. It uses the same stepped paper-grunge engine as `../roki` (24 fps, no motion blur, textures held on twos and fours) and the Roki design system's promo stack: a signal-red BLACK FRIDAY tag, white headline and one promo-yellow offer line on ink.

- `index.html`: the animation (Space plays and pauses, ←/→ step one frame, R replays).
- `out/roki-bf-wraps-ad.mp4`: the final ad with sound (H.264 BT.709, AAC 256k, −14 LUFS).
- `out/roki-bf-wraps-silent.mp4` and `out/roki-bf-sound.wav`: picture and sound as separate files.
- `scripts/render.mjs`, `scripts/sound.py`: export and procedural sound, as in the Grappler ad.

## Beat map (120 BPM, one beat = 0.5 s)

| Time | Scene | What happens |
| --- | --- | --- |
| 0.0 to 2.5 | Hook (ink) | BLACK FRIDAY tag and "BUY 3" on frame 0, then "GET 1" (0.5) and "FREE" (1.0) in promo-yellow |
| 2.5 | Catalogue (paper) | Impact flash. "PICK ANY 4." then "PAY FOR 3." (0.5 later) |
| 3.5 to 5.5 | | The five wraps stamp in as manga panels, one per beat: The Grappler, The Dragon, Sendo, Kamogawa, Gomu |
| 6.5 / 7.0 | | "4 WRAPS FOR A$89.97" deal box, then "A$29.99 each. The 4th one is on us." |
| 9.0 | End card (ink) | Ink brush wipe. The five prints fan in as slanted strips |
| 9.5 to 11.5 | | BLACK FRIDAY tag, "ANIME HAND WRAPS", "BUY 3 GET 1 FREE", "Plus 25% off apparel. 20 to 30 Nov.", "SHOP NOW" |
| 11.5 to 13.5 | | Final hit, held end card |

## Facts on screen (from Shopify, checked 24 Oct 2026)

- **BLACK FRIDAY WRAPS BUY 3 GET 1 FREE**: automatic discount on the five live wraps (Kamogawa Boxing Gym, The Grappler, The Dragon, Sendo, Gomu). Buy 3, get 1 free.
- **BLACK FRIDAY 25% OFF APPAREL**: automatic, on 38 apparel products. It does **not** include the hand wraps, so the ad says "25% off apparel" and never "25% off wraps".
- Both run 20 Nov 00:00 to 30 Nov 23:59 AEDT (19 Nov 13:00 to 1 Dec 12:59 UTC). Both are automatic, so the ad shows no code.
- Every wrap is A$29.99 (4.5m), so 4 wraps cost 3 × A$29.99 = A$89.97.
- Shinobi Hand Wraps is a draft and isn't in the discount, so it's left out. Kamogawa and Gomu are tagged preorder.

If the discount or prices change, edit the copy in `index.html` (`#s2` deal lines, `#s3` body line).

# PRX Cashback 12s: Build Notes

This is the paid-social ad from the "PRX Vault: 12s Paid Social Ad" brief. It is built in Remotion with the PRX design system: its tokens, its component bundle, merchant banners, the background, the logo and the paid-ad safe areas.

## Outputs (`out/`)

| File | What it is |
| --- | --- |
| `prx-cashback-12s.mp4` | Export, no overlay. H.264 High, yuv420p (BT.709, tv range), 1080 × 1920, 30 fps, 360 frames, 12.0 s, silent |
| `prx-cashback-12s-draft.mp4` | The same with the safe-area overlay (ad text safe, visual safe, focal, rail) and a frame counter |
| `frame-000.png` | Cover still (frame 0) |
| `qa-zones.json` | Zone QA report from the draft render: 360 frames checked, 0 failures |

## Re-render

```bash
cd prx-cashback-12s
npm install
npm run studio                          # live preview and scrubbing (draft overlay on by default)
npm run render                          # export + draft + frame-000.png + zone QA
node scripts/render.mjs --draft-only    # draft + zone QA only
node scripts/render.mjs --stills 0,120,215,330   # draft PNGs into out/stills/
npm run qa                              # re-check out/qa-frames.json without re-rendering
```

The render uses the preinstalled Chromium headless shell if one is present. Otherwise Remotion downloads its own; set `BROWSER=` to choose another.

## Where things live

| Change | File |
| --- | --- |
| Any word, rate, order value or cashback amount | `src/content.ts` (the only place) |
| Beat timings | the top of each `src/beats/Beat*.tsx` |
| Easing, durations, staggers, travel | `src/motion.ts` |
| Zones, type scale, resting positions | `src/layout.ts` (zones mirrored in `scripts/zones.mjs`) |
| PRX components, tokens | `src/prx/` (copied verbatim from the design system) |

## QA checklist (video-safe-areas, ad variant)

| # | Check | Result | How it was checked |
| --- | --- | --- | --- |
| 1 | Every text and logo element rests in x 65–850, y 270–1250 | Pass | DOM probe on all 360 frames: every `data-zone="text"` element above 0.3 opacity sits inside ad text safe. This covers entrances and exits too, so no text leaves the zone while readable |
| 2 | Hero visuals rest in visual safe | Pass | Same probe: the Receipt shell and the Primary base are inside x 60–1020, y 240–1680 |
| 3 | Rail zone empty | Pass | Same probe: nothing visible intersects x ≥ 850, y ≥ 1152 |
| 4 | Background reaches all four edges | Pass | `bg_gradient` covers the full canvas on every frame |
| 5 | Frame 0 works as a cover alone | Pass | The full hook and the Princess Polly banner are at rest on frame 0 with no animation played (`frame-000.png`) |
| 6 | "Cashback" appears on screen | Pass | Beat 2 "$0 Cashback.", beat 3 "Cashback lands", "Total Cashback" in beats 3 and 4 |
| 7 | Only one category (Fashion) | Pass | All three merchants are Fashion, and the Receipt labels each line "Fashion" |
| 8 | 1080 × 1920, 30 fps, exactly 360 frames | Pass | ffprobe on both MP4s: 360 frames read |
| + | Deterministic seeking | Pass | Frames 0, 100, 215 and 320 rendered twice came out byte-identical. There is no randomness: every value is a pure function of the frame |

## Placeholders (must be replaced before launch)

1. **Rates and amounts.** These are PLACEHOLDER figures, all in `src/content.ts`: Princess Polly AU 5% on $89.00 = +$4.45, ASOS 4% on $120.00 = +$4.80, Cotton On 6% on $65.00 = +$3.90, total +$13.15. Swap in live CLO rates on these exact merchants. The total is computed from the lines, so it updates by itself.
2. **The Receipt.** It isn't a formal design-system component yet. Following `ui-showcase-rules`, it's built from the OfferCard surface and text classes (`.prx-offer`, `.prx-offer-merchant`, `.prx-offer-category`) plus flat text. Replace it with the real Receipt component once that is specified.
3. **The Primary Block.** The 3D library has no plain "normal Block" render (solid Primary, isometric, matte). I checked all 87 names. "Block Symbol" is a stop sign, and the two unnamed Gemini images are an EFTPOS terminal and a check mark. As a stand-in, the Receipt rests on a flat `primary` base (`radius-40`) that shows 40px below it. This is not a 3D asset and doesn't claim to be. Swap in the Block render when one exists (`src/beats/Beat3Relief.tsx`).

## Decisions worth a second look

- **Beat 1 order: hook above the banner.** The `fail` colour drops below 3:1 contrast on `bg_gradient` from about y 900 down (2.4:1 at y 1250). So "$0.00" sits high (about 3.7:1, large text), and the Princess Polly banner sits below it, centred in the focal zone (centre y 930).
- **Beat 2 "$0.00" tags** sit on `dark-2` pills (4.4:1) for the same reason. The three banners form a list, with each row a banner beside its tag, which foreshadows the Receipt's line items.
- **Beat 1 → 2 banner move.** Princess Polly translates from its cover spot into row 1 and shrinks from 600px to 300px wide in the same eased move (the `move` curve, no overshoot). It doesn't spin and doesn't pop, but it does change size. If you want a strict translate only, the cover banner would have to start at 300px wide.
- **Type scale.** The design system has no video type tokens (`video-type-and-layout` is referenced but not published). Video uses every app token at 2.5×: headlines are `heading-lg` ×2.5 = 70px Manrope Bold, accent lines are `hero-md` ×2.5 = 100px Momo, and the beat 1 "$0.00" is `hero-lg` ×2.5 = 120px. PRX components mount at app size inside a `zoom: 2.5` wrapper, so their CSS is untouched. Each Momo accent sits on its own line, because the text-safe width (785px) can't hold it inline.
- **Fashion Hero Block not used.** The Clothing Rack Pillar (`d2c577cff72bdc07817048651dad3cf5`) exists. It was left out because beat 3 has no room in the 980px text-safe height without shrinking the Receipt, which is meant to be the hero. Also, `asset-context-guide` Context 5 says not to place a PRX object or block alongside merchant imagery, and the Receipt carries merchant logos.
- **Receipt logos are small.** The merchant banners show at 125 × 75 inside the Receipt, where the Princess Polly wordmark is barely legible. The merchant name beside each logo carries the read. Square logo marks for each merchant would read better.
- **Inter.** `tokens.css` still maps `--font-body` to Inter. `src/ad.css` overrides it to Manrope, per brand-rules.
- **Motion values.** `prx-motion.css` is not in the design system's current file listing. The curves, durations and staggers come from the repo's first promo, which read them from that file: enter, exit, move and settle beziers; fast 0.4s, base 0.7s, slow 1.1s; stagger 0.08s and 0.14s. Text travels 12px per the brief.
- **Loop.** Frames 346–359 clear the end card to the plain background, so the loop cuts straight to the frame-0 cover. The CTA is readable from about frame 292 (fully at rest by 307) and holds until 346, about 1.8s.
- **Silent.** No audio, built for sound-off viewing. The repo's `scripts/sound.py` approach could score it if a sound-on cut is wanted.

## Copy notes

- "Cashback lands **automatically**." is used verbatim from the brief. It conflicts with the repo's older `COPY.md` rule (never "automatic", use "confirmed"). The design system's `voice-and-copy`, which overrides older copy notes, doesn't ban it. This is a claims question for the missing `legal-and-claims` doc: cashback is matched and confirmed, so check that "automatically" is accurate for pending and confirmed timing.
- "$0 Cashback." is written without decimals, as the brief's copy has it. Every other amount uses AUD with two decimals.
- PokitPal is not named anywhere.

## Open before launch

- [ ] Replace placeholder rates and amounts with live CLO rates in `src/content.ts`. Watch the ~4 week PokitPal rate lag, and don't feature a merchant with a pending rate change.
- [ ] Confirm marketing rights for the Princess Polly, ASOS and Cotton On marks in promotional video.
- [ ] `legal-and-claims` is referenced by the design system but missing. The legal line is TBD; there is no room reserved for it yet, so a line inside y ≤ 1250 means re-spacing beat 4.
- [ ] The landing page's first screen must echo "Link your card once. Cashback lands automatically." (message match).
- [ ] Give this ad a unique UTM so its signups are tagged as a recruitment covariate for the ICP test.
- [x] Logo sharpness: `lockup.png` is 2013px wide and shows at 520px (downscaled), so it's sharp at 1080. A vector is still worth requesting for larger uses.
- [ ] A Receipt component and a plain Primary Block render in the design system (replaces placeholders 2 and 3).
- [ ] Before the campaign goes live, check the export in each platform's own in-app ad preview (Reels, Stories, TikTok).
- [ ] Remotion licence: free for individuals and companies of up to 3 people. Larger teams need a company licence.

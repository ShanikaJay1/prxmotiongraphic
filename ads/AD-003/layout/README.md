# AD-003 — Gear for Training Arc Static · approved layout

Brief: BR-003 (Top of funnel, Awareness, Animated infographic, General, Lifestyle, Stills, Feed 1080x1350). Hook HK-007.
Static post, no motion. Approved by Shan on 27 Oct 2026 (low-fi E, hi-fi V5).

## Files

- `AD-003-layout.html` — the layout source. Open in Chromium; it fits the headline, then sets `document.title` to `ready <size>`.
- `AD-003-layout.png` — the approved 1080x1350 render.
- `assets/` — everything the page loads. `source/` — the untouched Shopify model shots the panels were cut from.

## Copy

- Kicker (Anime Ace, caption box): STUCK IN FILLER EPISODES?
- Headline (Druk Wide, fitted to the 960px column, 87px): START YOUR TRAINING **ARC** (ARC in RokiRed)
- CTA (Poppins Bold, RokiRed, bare text): EXPLORE THE RANGE

## Panels (Roki design system › Model shots, synced from Shopify)

| Panel | Product | Source file | Crop (x0, y0, x1, y1 on source) |
| --- | --- | --- | --- |
| Hero, left 640px | Sendo Hand Wraps | `sendo-hand-wraps-04.jpg` | 0, 45, 1280, 1556 |
| Top-right | Liberation Wrist Wraps | `liberation-wrist-wraps-04.jpg` | 250, 520, 850, 1256 |
| Bottom-right | Rise T-Shirt | `rise-t-shirt-02.jpg` | 150, 170, 1180, 1434 |

House finish on every photo: contrast 1.1, brightness 0.95, blacks crushed 4%, 5px 45° screen-tone at 15% (12% on the light Rise shot), light grain.

## Design system rules applied, and the one broken

- 60px margins, wordmark bottom-left at 210px, 頂点へ block top-right at 190px, square corners, 8px ink panel borders.
- Style Rules require proof callouts or catalogue panels for Animated infographic. Shan chose to break that rule for this ad only.

## Fonts

Druk Wide and Anime Ace come from the Roki design system (`project/fonts/`) and are licensed to Roki. They are kept out of git (see `.gitignore`). Re-fetch them into `assets/` from the design system before rendering.

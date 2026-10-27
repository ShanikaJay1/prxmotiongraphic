# AD-006 Best Sellers Static Carousel: approved layout

Brief BR-006, approved by Shan on 27 Oct 2026. This is the source for every later stage.

- `slides/slide-1.png` to `slide-8.png`: the approved finished slides, 1080 × 1080.
- `slides/slide-*.html`: their sources. Open one in Chromium and it renders the same as the PNG, pixel for pixel. Rendering waits on `document.body.dataset.ready === '1'`.
- `assets/`: everything the slides load:
  - fonts: Druk Wide, Anime Ace and Poppins
  - Shopify flat lays and model shots
  - Roki logo files
  - halftone plates
  - grunge assets: pack seed 6, paper stock `cool`, dust, and splatters (plus their RokiRed copies)
- `src/`: the build scripts, for reference. `build_sq.py` is the final step. It sits on top of `build.py`, `build_h4.py` and `build_h4c.py`. `halftone.py` makes the RokiRed lifestyle plates, and `assetgen.py` is the paper-grunge generator.
- `AD-006-layout-sheet.jpg`: all 8 slides on one sheet.

## Slides

| # | Ground | Content |
|---|---|---|
| 1 | paper | Hook "THE GEAR PEOPLE KEEP COMING BACK FOR." over a line-up of all six flat lays, with wrap and shorts detail panels |
| 2 | ink | Kamogawa Boxing Gym Hand Wraps, RokiRed halftone strip of a wrapped fist, $29.99 |
| 3 | studio grey | Gomu Hand Wraps, $29.99 |
| 4 | paper | Kamogawa Boxing Gym Training Shirt: chest print and sleeve tag, RokiRed halftone of the KBG back print, $64.95 |
| 5 | ink | Ippo Fight Shorts: front and back, $99.95 |
| 6 | studio grey | The Fruit Lifting Straps, RokiRed halftone of a strap grip, $35.00 |
| 7 | paper | Muki Muki Pump Cover: back print, RokiRed halftone of the print on a model, $64.95 |
| 8 | ink | End card: six product tiles, "FIND YOURS.", SHOP NOW, rokiovertime.com |

## Overrides and open items (Shan's instructions, this ad only)

- **Static carousel, not a motion video.** Motion Build, Sound and Render need the same override, or the ad leaves the pipeline here.
- **Format 1:1 (1080 × 1080).** BR-006 says Story 1080x1920, and the Format dropdown has no 1:1 option. A confirmed brief isn't edited in place, so this needs deciding before Motion Build or Render read the brief's format.
- **Model shots.** The brief said flat lays only. Model shots are used in the four halftone lifestyle panels, as mood images. Every product hero is still a clean Shopify flat lay.
- **Colour.** The ground rotates paper, ink, studio grey. Accents are RokiRed on light grounds and signal-red on ink. The prices use RokiRed on white chips, so no RokiRed text sits on ink.
- **Prices** come from Shopify (AUD) on 27 Oct 2026. Recheck them before export.
- **Stock (open, from the brief).** The Training Shirt and the Muki Muki Pump Cover (Black) show 0 or negative stock in Shopify.
- **Hook claim (open, from the brief).** The hook implies repeat purchase, so back it with the returning-customer rate before the ad goes live.

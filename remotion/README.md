# PRX Vault: Social Brand Video (Remotion)

A 9:16 vertical video (1080 x 1920, 30 fps) for TikTok, Reels and Shorts. It comes as a 20 second master, a 15 second cutdown, and one 20 second file per hook for A/B testing.

Built with Remotion 4 (React + TypeScript). Every animation is driven by the frame number, so rendering twice gives identical output.

## Quick start

```bash
cd remotion
npm install
npm run studio      # live preview at http://localhost:3000
npm run stills      # review stills into out/stills/ (safe zones on)
npm run render      # all MP4s into out/
```

To use a Chrome or Chromium that is already installed instead of letting Remotion download one, set `REMOTION_BROWSER=/path/to/chrome-headless-shell` first.

## Changing copy, merchants and timing

Everything lives in `src/config.ts`. You never need to touch a component.

| What | Where in `config.ts` |
| --- | --- |
| On-screen copy (hook, question, reveal, steps, CTA, URL, disclaimer) | `copy` |
| Merchants on the brand wall and the CTA background | `merchants` |
| Hook variants for A/B testing | `hookVariants` |
| The example balance on the wallet screen | `exampleBalance` (always shown with the "Example" label) |
| Scene start frames for each cut | `cuts.master20`, `cuts.cutdown15` |
| Spring settings, overshoot, transition length, final hold | `motion` |
| Phone frame vs floating screen, grid vs marquee wall | `layout` |
| Music, beat snapping, sound effects | `audio` |

**Accent words.** Wrap a short phrase in asterisks, like `"So why aren't you getting *paid back*?"`. It is then set in Momo Trust Display, in Fawn on dark backgrounds. The brand book allows one short phrase per line.

**Merchants.** Each entry needs a logo at `assets/merchants/<slug>.svg` or `.png`:

```ts
{ slug: "nike", name: "Nike", cashback: "", category: "Sports & Fitness" },
```

- Only list brands PRX has confirmed it may market. Delete a line to drop a brand everywhere.
- Leave `cashback` empty unless the rate is confirmed. When it is set (for example `"Up to 8%"`), a badge appears on that brand's card. Nothing else in the video shows a rate.
- With 12 merchants or fewer, the wall is a 3-column grid that cascades in and scrolls. With more than 12, it becomes two rows scrolling in opposite directions. Set `layout.brandWall` to `"grid"` or `"marquee"` to force either one.

**Adding a hook variant.** Add a string to `hookVariants`. The next `npm run render` also writes `out/prx-vault-20s-hook-<n>.mp4`, where `n` is its position in the list, starting from 1. The hook sizes and wraps itself between 140 and 180 px, with at most two words per line.

**Timing.** Scene starts are frame numbers at 30 fps. Each cut between scenes is a 9-frame slide or wipe that begins on the listed frame. To drop a scene from a cut, remove its line. If you add a music track, setting `audio.bpm` snaps every cut to the nearest beat.

## Assets

```
assets/
  brand/      prx-logo.png (lockup), prx-logo-mark.png, brand.json (colours + fonts)
  merchants/  <slug>.svg, copied from the design system's Merchant Banners
  screens/    app-home.png, app-balance.png (design system mobile screens)
  fonts/      Manrope 400/700/800, Momo Trust Display (local, no system fonts)
  audio/      track.mp3 (optional music bed), sfx/ (generated)
```

`npm run scan` runs before every studio, stills or render command. It records which files exist and rewrites `MISSING_ASSETS.md`. Any missing file renders as a grey box with its file name on it. Nothing is ever drawn in place of a real logo.

**Music.** Drop a file at `assets/audio/track.mp3`. It fades in over 0.5s and out over 1s. With no track, the MP4 still carries a silent AAC track.

**Sound effects.** The pops, ticks and CTA chime are synthesised by `npm run sfx` (`scripts/make-sfx.mjs`), so there is nothing to license. Turn them all off with `audio.sfx = false`, or for a single render with the `muteSfx` prop.

## Render commands

```bash
npm run stills       # out/stills/*.png: middle frame of every scene (20s and 15s),
                     # frame 0, final frame, every hook, and the phone and grid alternatives
npm run render       # out/prx-vault-20s.mp4, out/prx-vault-15s.mp4,
                     # out/prx-vault-20s-hook-1.mp4 ... one per hook variant
npm run render:all   # both

# Single renders through the Remotion CLI:
npx remotion render src/index.ts PRX-Master-20s out/prx-vault-20s.mp4 --enforce-audio-track
npx remotion render src/index.ts PRX-Cutdown-15s out/prx-vault-15s.mp4 --enforce-audio-track
npx remotion render src/index.ts PRX-Master-20s out/hook-2.mp4 --props='{"cut":"master20","hookVariant":2,"showSafeZones":false,"muteSfx":false}'
npx remotion still  src/index.ts PRX-Master-20s out/frame.png --frame=300 --props='{"cut":"master20","hookVariant":null,"showSafeZones":true,"muteSfx":false}'
```

Props on `PRX-Master-20s` and `PRX-Cutdown-15s`:

| Prop | Values |
| --- | --- |
| `hookVariant` | `null` uses `copy.hook`. `1`, `2`, `3` pick from `hookVariants` |
| `showSafeZones` | `true` overlays the unsafe areas in red (for review only) |
| `muteSfx` | `true` removes the sound-effect layer |
| `uiFrame`, `brandWall` | optional overrides of `config.layout` |

In Studio, each scene is also its own composition under **Scenes**, with safe zones on.

## Storyboard (20s master)

| # | Frames | Scene | Notes |
| --- | --- | --- | --- |
| 1 | 0 to 60 | Hook | Solid violet. Each word springs from 0.6 to 1.0 scale, 2 frames apart. Every word is on screen from frame 0, so the first frame works as a cover |
| 2 | 60 to 120 | The turn | The question, then a receipt slides up. "$0 back" draws on, then is struck through |
| 3 | 120 to 195 | Reveal | The mark pops in with one accent ring pulse, PRX and VAULT resolve beside it, then the value line |
| 4 | 195 to 360 | Brand wall | Cards cascade in diagonally (3 frames apart), the wall scrolls, and three cards lift |
| 5 | 360 to 495 | How it works | The real web app UI. Three steps tick in. The example balance counts up in a callout labelled "Example" |
| 6 | 495 to 600 | CTA | Lockup, CTA, URL button with a gentle pulse, disclaimer. The last 15 frames are completely still |

The 15s cut drops scene 2, gives the brand wall 4s and How it works 3s, and keeps the CTA at 3.5s. The logo is clear by 4s.

## Where this departs from the brief, and why

The PRX design system wins over the brief where they disagree. Each of these is a single switch in `config.ts`:

- **No overshoot.** The brand book bans bounce and overshoot, so the brief's spring (`damping 14, stiffness 120, mass 0.8`) runs with its overshoot clamped. Set `motion.allowOvershoot: true` for the brief's look.
- **No phone mockup.** The brand book rules out device mockups, so the UI sits on a floating card. Set `layout.uiFrame: "phone"` for the brief's phone frame.
- **No radial glow.** The only gradient the brand allows is linear Violet to Dark 1, so the reveal's "glow pulse" is a single expanding accent ring instead.
- **Stricter safe zones.** The design system's zones (top 270, bottom 480, left 90, right 230, and the lower-right rail) are stricter than the brief's on every edge, so meeting them meets both. Text is centred on the text-safe box (x 470), not the frame.
- **Manrope, not Inter.** The brand book uses only Manrope and Momo Trust Display.
- **Wordmark by line.** The logo is raster only, so the wordmark reveals line by line (PRX, then VAULT) rather than letter by letter.

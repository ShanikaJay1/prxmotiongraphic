// PRX video safe areas (design system: assets/Video/prx-video-safe-areas.css).
// These are stricter than the brief (top 220, bottom 380, right 96) on every
// edge, so content inside them satisfies both.
export const SAFE = {
  text: { x: 90, y: 270, w: 760, h: 1170 }, // headlines, logos, CTAs, UI
  visual: { x: 60, y: 240, w: 960, h: 1440 }, // hero visuals
  rail: { x: 850, y: 1152, w: 230, h: 768 }, // keep empty
  focal: { x: 90, y: 420, w: 760, h: 1020 }, // main anchor and frame 0
  brief: { top: 220, bottom: 380, right: 96 },
};
export const TEXT_CENTER_X = SAFE.text.x + SAFE.text.w / 2; // 470: centre on the text box, not the frame

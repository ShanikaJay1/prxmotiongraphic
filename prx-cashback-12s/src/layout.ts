/**
 * Canvas, zones and resting positions (px on the 1080x1920 canvas).
 * Zones come from the design system's prx-video-safe-areas.css, paid-ad (--ad) variant.
 */
export const W = 1080;
export const H = 1920;

export type Rect = { x: number; y: number; w: number; h: number };

export const ZONES = {
  adText: { x: 65, y: 270, w: 785, h: 980 } as Rect, // text, logos, CTA, Receipt text
  visual: { x: 60, y: 240, w: 960, h: 1440 } as Rect, // banners, 3D, hero visuals
  focal: { x: 90, y: 420, w: 760, h: 1020 } as Rect, // frame-0 anchor
  rail: { x: 850, y: 1152, w: 230, h: 768 } as Rect, // keep empty
};

/** Horizontal axis everything centres on: the middle of ad text safe. */
export const AXIS_X = ZONES.adText.x + ZONES.adText.w / 2; // 457.5

/**
 * Type and UI scale. The design system's type, spacing and radius tokens are
 * authored for app UI; video uses each token at 2.5x (there is no video type
 * scale in the system yet). PRX components are mounted at app size inside a
 * zoom: 2.5 wrapper so their own CSS stays untouched.
 */
export const S = 2.5;
export const HEADLINE = { size: 28 * S, line: 28 * S * 1.2, tracking: -0.56 * S }; // heading-lg x2.5
export const ACCENT = { size: 40 * S, line: 40 * S * 1.2 }; // hero-md x2.5
export const ACCENT_HERO = { size: 48 * S, line: 48 * S * 1.2 }; // hero-lg x2.5

export const HEADLINE_TOP = 280;

export const BEAT1 = {
  // Merchant banner centred in the focal zone (centre y = 930).
  banner: { x: AXIS_X - 300, y: 930 - 180, w: 600, h: 360 } as Rect,
};

export const BEAT2 = {
  rowsTop: 600,
  rowGap: 25,
  banner: { w: 300, h: 180 },
  tagGap: 40,
  tagW: 200,
};
export const BEAT2_ROW_X = AXIS_X - (BEAT2.banner.w + BEAT2.tagGap + BEAT2.tagW) / 2;
export const beat2Row = (i: number): Rect => ({
  x: BEAT2_ROW_X,
  y: BEAT2.rowsTop + i * (BEAT2.banner.h + BEAT2.rowGap),
  w: BEAT2.banner.w,
  h: BEAT2.banner.h,
});

export const RECEIPT = {
  appW: 300, // app px, zoomed x2.5 -> 750
  top: 600,
  /** Primary Block base shows this far below the Receipt (canvas px). */
  blockDepth: 40,
};
export const RECEIPT_X = AXIS_X - (RECEIPT.appW * S) / 2;

export const BEAT4 = {
  lockup: { w: 520, top: 290 }, // lockup.png is 2013x1053
  headlineTop: 610,
  totalTop: 860,
  ctaTop: 1070,
};

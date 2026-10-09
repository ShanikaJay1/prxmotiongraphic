// Single source of truth for every variant of the PRX Vault social video.
// Marketing can change copy, merchants, timings and toggles here without
// touching any component. This file must stay import-free so the Node scripts
// (scan-assets, render) can read it too.

export type Merchant = {
  slug: string; // file name in assets/merchants/<slug>.svg|png
  name: string;
  cashback: string; // e.g. "Up to 8%". Leave "" unless the rate is confirmed.
  category: string;
};

// Only merchants PRX has confirmed it may market. Remove a line to drop a brand.
// Logos come from the PRX design system's Merchant Banners. Leave cashback empty
// until a rate is confirmed: an empty value hides the badge on the card.
export const merchants: Merchant[] = [
  { slug: "nike", name: "Nike", cashback: "", category: "Sports & Fitness" },
  { slug: "princess-polly", name: "Princess Polly", cashback: "", category: "Fashion" },
  { slug: "new-balance", name: "New Balance", cashback: "", category: "Sports & Fitness" },
  { slug: "swarovski", name: "Swarovski", cashback: "", category: "Fashion" },
  { slug: "asos", name: "ASOS", cashback: "", category: "Fashion" },
  { slug: "cotton-on", name: "Cotton On", cashback: "", category: "Fashion" },
  { slug: "bondi-sands", name: "Bondi Sands", cashback: "", category: "Beauty" },
  { slug: "myer", name: "Myer", cashback: "", category: "Fashion" },
  { slug: "supre", name: "Supré", cashback: "", category: "Fashion" },
  { slug: "hugo-boss", name: "HUGO BOSS", cashback: "", category: "Fashion" },
  { slug: "vans", name: "Vans", cashback: "", category: "Fashion" },
  { slug: "ray-ban", name: "Ray-Ban", cashback: "", category: "Fashion" },
  { slug: "brooks-running", name: "Brooks Running", cashback: "", category: "Sports & Fitness" },
  { slug: "tommy-hilfiger", name: "Tommy Hilfiger", cashback: "", category: "Fashion" },
  { slug: "platypus", name: "Platypus", cashback: "", category: "Fashion" },
  { slug: "reebok", name: "Reebok", cashback: "", category: "Sports & Fitness" },
  { slug: "rm-williams", name: "R.M. Williams", cashback: "", category: "Fashion" },
  { slug: "everlast", name: "Everlast", cashback: "", category: "Sports & Fitness" },
  { slug: "windsor-smith", name: "Windsor Smith", cashback: "", category: "Fashion" },
];

// Wrap a short phrase in *asterisks* to set it in the Momo Trust Display
// accent face (one short phrase per line, per the brand book).
export const copy = {
  hook: "You're shopping anyway",
  turn: "So why aren't you getting *paid back*?",
  receiptLine: "$0 back",
  reveal: "Cashback from the brands you *already love*",
  wall: "Big names. *Real cashback.*",
  steps: ["Join PRX Vault free", "Shop your favourite brands", "Get paid in cash or gift cards"],
  cta: "Join *free* at prxvault.com",
  url: "prxvault.com",
  disclaimer: "Cashback rates vary by brand. T&Cs apply.",
  exampleLabel: "Example",
  balanceLabel: "Total Cashback",
};

// One 20s MP4 is rendered per hook (prx-vault-20s-hook-<n>.mp4, n from 1).
// hookIndex 0 uses copy.hook.
export const hookVariants = [
  "You're shopping anyway",
  "Your online shopping should pay you back",
  "Stop leaving money at checkout",
];

// Illustrative only. Always shown with copy.exampleLabel beside it.
export const exampleBalance = { amount: 48.2, currency: "$" };

export const video = {
  width: 1080,
  height: 1920,
  fps: 30,
};

// Scene start frames. Every cut is a 9-frame slide or wipe, which starts on the
// listed frame. Scenes not listed are dropped from that cut.
export type SceneId = "hook" | "turn" | "reveal" | "wall" | "how" | "cta";
export const cuts = {
  master20: {
    durationInFrames: 600,
    scenes: [
      { id: "hook", start: 0 },
      { id: "turn", start: 60 },
      { id: "reveal", start: 120 },
      { id: "wall", start: 195 },
      { id: "how", start: 360 },
      { id: "cta", start: 495 },
    ] as { id: SceneId; start: number }[],
  },
  cutdown15: {
    durationInFrames: 450,
    scenes: [
      { id: "hook", start: 0 },
      { id: "reveal", start: 60 },
      { id: "wall", start: 135 },
      { id: "how", start: 255 },
      { id: "cta", start: 345 },
    ] as { id: SceneId; start: number }[],
  },
};

export const motion = {
  // The brief's spring. The PRX brand book bans bounce and overshoot, so the
  // overshoot is clamped by default. Set allowOvershoot to true for the brief's
  // "small overshoot" feel.
  spring: { damping: 14, stiffness: 120, mass: 0.8 },
  softSpring: { damping: 20, stiffness: 120, mass: 0.8 },
  allowOvershoot: false,
  transitionFrames: 9,
  holdFrames: 15, // final CTA frames held completely still
};

export const layout = {
  // "floating": the app screen as a floating card (brand book: no device mockups).
  // "phone": the brief's phone frame.
  uiFrame: "floating" as "floating" | "phone",
  // "auto": grid for up to 12 merchants, two counter-scrolling rows above that.
  brandWall: "auto" as "auto" | "grid" | "marquee",
};

export const audio = {
  music: "audio/track.mp3", // used only if the file exists
  musicVolume: 0.8,
  bpm: null as number | null, // set to snap scene cuts to the nearest beat
  sfx: true, // UI pops, ticks and the CTA chime. false mutes the whole SFX track
  sfxVolume: 0.5,
};

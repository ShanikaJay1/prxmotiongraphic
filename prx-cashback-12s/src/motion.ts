/**
 * PRX Motion Rules: easing curves, durations, staggers and travel from the
 * design system's prx-motion.css (the same values the repo's first promo
 * used). No bounce, overshoot or elastic: every curve stays inside 0..1.
 */
import { Easing, interpolate } from 'remotion';
import type { CSSProperties } from 'react';

export const FPS = 30;
const f = (seconds: number) => seconds * FPS;

export const EASE = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  move: Easing.bezier(0.76, 0, 0.24, 1),
  settle: Easing.bezier(0.25, 1, 0.5, 1),
  drift: Easing.bezier(0.37, 0, 0.63, 1),
};

/** Durations in frames. */
export const DUR = { micro: f(0.2), fast: f(0.4), base: f(0.7), slow: f(1.1), hero: f(1.6) };
/** Staggers in frames. */
export const STAGGER = { tight: f(0.04), base: f(0.08), wide: f(0.14) };
export const EXIT_RATIO = 0.6;

/** Travel in px. Text travels 12px (brief, section 4). */
export const TRAVEL = { text: 12, md: 32, lg: 72 };

export const prog = (frame: number, start: number, dur: number, ease = EASE.enter) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type MotionOpts = {
  /** Entrance start frame; omit to be at rest from the first frame. */
  inAt?: number;
  /** Exit start frame; omit to stay. */
  outAt?: number;
  d?: number;
  ease?: (t: number) => number;
  dy?: number;
  dx?: number;
};

/**
 * Enter (fade + travel), hold at rest, exit with ease-exit at 60% of the
 * entrance duration, continuing half the travel. Pure function of frame.
 */
export function motion(frame: number, { inAt, outAt, d = DUR.fast, ease = EASE.settle, dy = TRAVEL.text, dx = 0 }: MotionOpts): CSSProperties {
  const p = inAt == null ? 1 : prog(frame, inAt, d, ease);
  const q = outAt == null ? 0 : prog(frame, outAt, d * EXIT_RATIO, EASE.exit);
  const x = (1 - p) * dx - q * dx * 0.5;
  const y = (1 - p) * dy - q * dy * 0.5;
  return { opacity: p * (1 - q), transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)` };
}

/** Text: settle curve, fast duration, 12px travel. */
export const textMotion = (frame: number, o: MotionOpts) => motion(frame, { d: DUR.fast, ease: EASE.settle, dy: TRAVEL.text, ...o });

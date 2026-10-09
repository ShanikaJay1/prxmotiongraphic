import { Easing, interpolate, spring } from "remotion";
import { motion, video } from "./config";

export const EASE_IN = Easing.bezier(0.16, 1, 0.3, 1); // expo out, for entrances
export const EASE_OUT = Easing.bezier(0.7, 0, 0.84, 0); // for exits

const springConfig = (soft: boolean) => ({
  ...(soft ? motion.softSpring : motion.spring),
  overshootClamping: !motion.allowOvershoot,
});

// 0 -> 1 spring starting at `delay` frames.
export const pop = (frame: number, delay = 0, soft = false, durationInFrames?: number) =>
  spring({ frame: frame - delay, fps: video.fps, config: springConfig(soft), durationInFrames });

// Eased 0 -> 1 progress between two frames.
export const enter = (frame: number, from: number, length: number) =>
  interpolate(frame, [from, from + length], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const exit = (frame: number, from: number, length: number) =>
  interpolate(frame, [from, from + length], [0, 1], {
    easing: EASE_OUT,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lerp = (t: number, a: number, b: number) => a + (b - a) * t;

import React from "react";
import { Img, interpolate } from "remotion";
import { resolveAsset } from "../assets";
import { EASE_IN, lerp, pop } from "../motion";
import { Placeholder } from "./Placeholder";

// Regions of the supplied lockup PNG (2013 x 1053), measured from its alpha.
// The wordmark is never redrawn: each region is the same file, clipped.
const W = 2013;
const H = 1053;
const SPLIT_X = 1028 / W; // mark | wordmark
const SPLIT_Y = 503 / H; // PRX | VAULT
const MARK_CX = 531 / W;

export const LOCKUP_ASPECT = H / W;

type Props = {
  width: number;
  frame: number;
  // Frame the mark pops in, and the frame the wordmark starts to resolve.
  // Omit both for a static lockup.
  markAt?: number;
  wordAt?: number;
  markOffsetX?: number; // where the mark starts, relative to its final spot
};

export const Lockup: React.FC<Props> = ({ width, frame, markAt, wordAt, markOffsetX = 0 }) => {
  const lockup = resolveAsset("brand/prx-logo.svg", "brand/prx-logo.png");
  const height = Math.round(width * LOCKUP_ASPECT);
  if (!lockup) return <Placeholder file="brand/prx-logo.svg" style={{ width, height }} />;
  const animated = markAt !== undefined && wordAt !== undefined;
  const m = animated ? pop(frame, markAt) : 1;
  const move = animated ? interpolate(frame, [wordAt - 2, wordAt + 14], [0, 1], { easing: EASE_IN, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const line = (delay: number) => (animated ? pop(frame, wordAt + delay) : 1);
  const prx = line(0);
  const vault = line(4);
  const img = (clip: string, style: React.CSSProperties = {}) => (
    <Img src={lockup.src} style={{ position: "absolute", inset: 0, width, height, clipPath: clip, ...style }} />
  );
  const sx = SPLIT_X * 100;
  const sy = SPLIT_Y * 100;
  return (
    <div style={{ position: "relative", width, height }}>
      {img(`inset(0 ${100 - sx}% 0 0)`, {
        transformOrigin: `${MARK_CX * width}px ${height / 2}px`,
        transform: `translateX(${lerp(move, markOffsetX, 0)}px) scale(${m * lerp(move, 1.25, 1)})`,
      })}
      {img(`inset(0 ${lerp(prx, 100 - sx, 0)}% ${100 - sy}% ${sx}%)`, {
        opacity: prx,
        transform: `translateY(${lerp(prx, 30, 0)}px)`,
      })}
      {img(`inset(${sy}% ${lerp(vault, 100 - sx, 0)}% 0 ${sx}%)`, {
        opacity: vault,
        transform: `translateY(${lerp(vault, 30, 0)}px)`,
      })}
    </div>
  );
};

export const lockupMarkCenter = (width: number) => ({ x: MARK_CX * width, y: (width * LOCKUP_ASPECT) / 2 });

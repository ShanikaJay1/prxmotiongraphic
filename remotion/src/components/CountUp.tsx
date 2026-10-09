import React from "react";
import { interpolate } from "remotion";
import { EASE_IN } from "../motion";

// Counts from 0 to `value` between two frames. Tabular figures so the width
// does not jitter while it counts.
export const CountUp: React.FC<{
  value: number;
  frame: number;
  from: number;
  length: number;
  prefix?: string;
  decimals?: number;
  style?: React.CSSProperties;
}> = ({ value, frame, from, length, prefix = "", decimals = 2, style }) => {
  const v = interpolate(frame, [from, from + length], [0, value], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {v.toFixed(decimals)}
    </span>
  );
};

import React, { useMemo } from "react";
import { interpolate } from "remotion";
import { colors, fonts, radius } from "../brand";
import { EASE_IN, lerp, pop } from "../motion";
import { fitLines } from "./text";

const CHECK = "M14 27 L23 36 L40 17";
const CHECK_LENGTH = 34;

// Numbered steps. Each rises in from below, then its number turns into a
// checkmark that draws on.
export const StepList: React.FC<{
  steps: string[];
  frame: number;
  starts: number[]; // frame each step enters
  width: number;
  fontSize?: number;
}> = ({ steps, frame, starts, width, fontSize = 56 }) => {
  const badge = Math.round(fontSize * 1.25);
  const textWidth = width - badge - 28;
  const wrapped = useMemo(
    () =>
      steps.map(
        (s) =>
          fitLines(s, { maxWidth: textWidth, maxHeight: 9999, minSize: fontSize, maxSize: fontSize, weight: "700", lineHeight: 1.1 })
            .lines,
      ),
    [steps, textWidth, fontSize],
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, width }}>
      {steps.map((_, i) => {
        const p = pop(frame, starts[i]);
        const check = interpolate(frame, [starts[i] + 6, starts[i] + 16], [0, 1], {
          easing: EASE_IN,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 28,
              opacity: p,
              transform: `translateY(${lerp(p, 50, 0)}px)`,
            }}
          >
            <div
              style={{
                width: badge,
                height: badge,
                flex: "none",
                borderRadius: radius.full,
                background: check > 0 ? colors.success : colors.primary,
                position: "relative",
                marginTop: Math.round(fontSize * 0.02),
              }}
            >
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: Math.round(fontSize * 0.62),
                  color: colors.text,
                  opacity: 1 - Math.min(1, check * 3),
                }}
              >
                {i + 1}
              </span>
              <svg viewBox="0 0 54 54" width={badge} height={badge} style={{ position: "absolute", inset: 0 }}>
                <path
                  d={CHECK}
                  fill="none"
                  stroke={colors.background}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={CHECK_LENGTH}
                  strokeDashoffset={CHECK_LENGTH * (1 - check)}
                />
              </svg>
            </div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize, lineHeight: 1.1, color: colors.text, letterSpacing: -0.02 * fontSize }}>
              {wrapped[i].map((line, li) => (
                <div key={li} style={{ whiteSpace: "nowrap" }}>
                  {line.map((t) => t.text).join(" ")}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

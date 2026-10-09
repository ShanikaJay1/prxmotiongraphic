import React from "react";
import { interpolate } from "remotion";
import { colors, fonts, radius } from "../brand";
import { EASE_IN } from "../motion";

// A plain receipt built from simple shapes. Item rows are abstract bars, so it
// shows no invented prices. `line` draws on, then a strike goes through it.
export const Receipt: React.FC<{
  frame: number;
  line: string;
  lineAt: number;
  strikeAt: number;
  width?: number;
}> = ({ frame, line, lineAt, strikeAt, width = 560 }) => {
  const reveal = interpolate(frame, [lineAt, lineAt + 12], [0, 100], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const strike = interpolate(frame, [strikeAt, strikeAt + 9], [0, 1], {
    easing: EASE_IN,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar = (w: number, o = 0.22): React.CSSProperties => ({
    height: 22,
    width: w,
    borderRadius: radius.sm,
    background: `rgba(255,255,255,${o})`,
  });
  const rows = [
    [0.46, 0.18],
    [0.34, 0.16],
    [0.52, 0.2],
  ];
  const inner = width - 96;
  const teeth = 14;
  return (
    <div style={{ width, position: "relative" }}>
      <div
        style={{
          background: colors.surfaceRaised,
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          padding: "48px 48px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <div style={bar(inner * 0.36, 0.4)} />
        </div>
        {rows.map(([a, b], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={bar(inner * a)} />
            <div style={bar(inner * b)} />
          </div>
        ))}
        <div style={{ borderTop: `4px dashed ${colors.border}`, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={bar(inner * 0.22, 0.4)} />
          <div style={bar(inner * 0.24, 0.4)} />
        </div>
        <div style={{ position: "relative", alignSelf: "center", marginTop: 18 }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 96,
              letterSpacing: -2,
              color: colors.text,
              clipPath: `inset(0 ${100 - reveal}% 0 0)`,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </div>
          <div
            style={{
              position: "absolute",
              left: -14,
              right: -14,
              top: "52%",
              height: 12,
              borderRadius: radius.full,
              background: colors.fail,
              transformOrigin: "left center",
              transform: `scaleX(${strike}) rotate(-4deg)`,
            }}
          />
        </div>
      </div>
      <svg width={width} height={28} viewBox={`0 0 ${teeth * 2} 2`} preserveAspectRatio="none" style={{ display: "block" }}>
        <path
          d={`M0 0 ${Array.from({ length: teeth }, (_, i) => `L${i * 2 + 1} 2 L${i * 2 + 2} 0`).join(" ")} Z`}
          fill={colors.surfaceRaised}
        />
      </svg>
    </div>
  );
};

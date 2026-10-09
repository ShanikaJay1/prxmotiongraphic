import React from "react";
import { colors, radius } from "../brand";

type FrameProps = { width: number; height: number; children: React.ReactNode; style?: React.CSSProperties };

// The brief's phone frame. Kept for the "phone" option in config.layout.uiFrame,
// but the PRX brand book rules out device mockups, so it is off by default.
export const PhoneFrame: React.FC<FrameProps> = ({ width, height, children, style }) => {
  const bezel = Math.round(width * 0.035);
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        padding: bezel,
        borderRadius: Math.round(width * 0.15),
        background: "#0A0814",
        border: `3px solid ${colors.border}`,
        boxShadow: "0 40px 90px rgba(4, 2, 14, 0.65)",
        position: "relative",
        ...style,
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: Math.round(width * 0.12), overflow: "hidden", position: "relative" }}>
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: bezel + Math.round(width * 0.03),
          left: "50%",
          transform: "translateX(-50%)",
          width: Math.round(width * 0.28),
          height: Math.round(width * 0.075),
          borderRadius: radius.full,
          background: "#000",
        }}
      />
    </div>
  );
};

// Brand-compliant staging: the real interface as a floating card with depth.
export const FloatingScreen: React.FC<FrameProps> = ({ width, height, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius.xl,
      overflow: "hidden",
      position: "relative",
      border: `2px solid ${colors.border}`,
      boxShadow: "0 40px 90px rgba(4, 2, 14, 0.65), 0 0 0 1px rgba(255,255,255,0.04)",
      background: colors.background,
      ...style,
    }}
  >
    {children}
  </div>
);

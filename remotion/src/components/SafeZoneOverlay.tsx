import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE } from "../safe";

const RED = "rgba(255, 30, 30, 0.28)";
const label: React.CSSProperties = {
  position: "absolute",
  fontFamily: "monospace",
  fontSize: 22,
  color: "#fff",
  background: "rgba(200,0,0,0.85)",
  padding: "4px 8px",
};

// Review overlay (showSafeZones). Red = outside text safe, where platform UI
// sits. Never rendered in final exports.
export const SafeZoneOverlay: React.FC = () => {
  const t = SAFE.text;
  const v = SAFE.visual;
  const f = SAFE.focal;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 1000 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: t.y, background: RED }} />
      <div style={{ position: "absolute", left: 0, top: t.y + t.h, width: 1080, bottom: 0, background: RED }} />
      <div style={{ position: "absolute", left: 0, top: t.y, width: t.x, height: t.h, background: RED }} />
      <div style={{ position: "absolute", left: t.x + t.w, top: t.y, right: 0, height: t.h, background: RED }} />
      <div style={{ position: "absolute", left: SAFE.rail.x, top: SAFE.rail.y, right: 0, bottom: 0, background: "rgba(255,0,0,0.35)" }} />
      <div style={{ position: "absolute", left: t.x, top: t.y, width: t.w, height: t.h, border: "3px solid #ff3b3b", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: v.x, top: v.y, width: v.w, height: v.h, border: "3px dashed #ffd23b", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: f.x, top: f.y, width: f.w, height: f.h, border: "3px dotted #3bd5ff", boxSizing: "border-box" }} />
      <div style={{ ...label, left: 12, top: 12 }}>red: unsafe · solid: text safe · dashed: visual safe · dotted: focal</div>
      <div style={{ ...label, left: SAFE.rail.x + 8, top: SAFE.rail.y + 8 }}>action rail</div>
    </AbsoluteFill>
  );
};

import React from "react";
import { colors, fonts, radius } from "../brand";
import { lerp, pop } from "../motion";

// Pill button that springs in, pulses 1.0 -> 1.04 every `period` frames, and
// settles exactly at 1.0 on a cycle boundary before `holdFrom` (still frames).
export const CtaButton: React.FC<{
  label: string;
  frame: number;
  enterAt: number;
  holdFrom: number;
  period?: number;
  fontSize?: number;
}> = ({ label, frame, enterAt, holdFrom, period = 20, fontSize = 64 }) => {
  const p = pop(frame, enterAt);
  const pulseStart = enterAt + 18;
  const lastCycleEnd = pulseStart + Math.max(0, Math.floor((holdFrom - pulseStart) / period)) * period;
  const t = Math.max(0, Math.min(frame, lastCycleEnd) - pulseStart);
  const pulse = frame < pulseStart ? 0 : 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period);
  return (
    <div
      style={{
        display: "inline-block",
        padding: `${Math.round(fontSize * 0.42)}px ${Math.round(fontSize * 0.9)}px`,
        borderRadius: radius.full,
        background: colors.primary,
        color: colors.text,
        fontFamily: fonts.display,
        fontWeight: 800,
        fontSize,
        letterSpacing: -0.01 * fontSize,
        whiteSpace: "nowrap",
        opacity: p,
        transform: `translateY(${lerp(p, 60, 0)}px) scale(${lerp(p, 0.7, 1) * (1 + 0.04 * pulse)})`,
        boxShadow: `0 20px 60px rgba(117, 63, 228, ${0.35 + 0.2 * pulse})`,
      }}
    >
      {label}
    </div>
  );
};

import React from "react";
import { AbsoluteFill } from "remotion";
import { colors } from "../brand";

// "primary": solid violet. "dark": Dark 1. "gradient": Dark 1 with the brand's
// one permitted gradient (Violet -> Dark 1, linear) rising from the bottom.
export const Background: React.FC<{ variant: "primary" | "dark" | "gradient"; strength?: number }> = ({
  variant,
  strength = 0.6,
}) => (
  <AbsoluteFill style={{ background: variant === "primary" ? colors.primary : colors.background }}>
    {variant === "gradient" ? (
      <AbsoluteFill
        style={{ background: `linear-gradient(180deg, rgba(117,63,228,0) 35%, ${colors.primary} 100%)`, opacity: strength }}
      />
    ) : null}
  </AbsoluteFill>
);

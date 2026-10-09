import React from "react";
import { Img } from "remotion";
import { merchantLogo } from "../assets";
import { colors, fonts, radius } from "../brand";
import type { Merchant } from "../config";
import { lerp } from "../motion";
import { Placeholder } from "./Placeholder";

// A partner logo on a white card. The logo file is shown exactly as supplied:
// aspect ratio preserved, never cropped, stretched or recoloured.
export const LogoCard: React.FC<{
  merchant: Merchant;
  width: number;
  lift?: number; // 0..1, scales to 1.08 with a deeper shadow
  style?: React.CSSProperties;
}> = ({ merchant, width, lift = 0, style }) => {
  const logo = merchantLogo(merchant.slug);
  const pad = Math.round(width * 0.04);
  const inner = width - pad * 2;
  const logoHeight = Math.round((inner * 240) / 400);
  return (
    <div
      style={{
        width,
        padding: pad,
        boxSizing: "border-box",
        background: "#FFFFFF",
        borderRadius: radius.lg,
        position: "relative",
        transform: `scale(${lerp(lift, 1, 1.08)})`,
        boxShadow: `0 ${lerp(lift, 10, 34)}px ${lerp(lift, 28, 70)}px rgba(6, 4, 18, ${lerp(lift, 0.35, 0.6)})`,
        ...style,
      }}
    >
      {logo ? (
        <Img
          src={logo.src}
          style={{ width: inner, height: logoHeight, objectFit: "contain", display: "block", borderRadius: radius.md }}
        />
      ) : (
        <Placeholder file={`merchants/${merchant.slug}.svg`} style={{ width: inner, height: logoHeight, borderRadius: radius.md }} />
      )}
      {merchant.cashback ? (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -Math.round(width * 0.07),
            transform: "translateX(-50%)",
            background: colors.accent,
            color: colors.background,
            fontFamily: fonts.display,
            fontWeight: 800,
            fontSize: Math.max(28, Math.round(width * 0.1)),
            padding: `${Math.round(width * 0.02)}px ${Math.round(width * 0.06)}px`,
            borderRadius: radius.full,
            whiteSpace: "nowrap",
          }}
        >
          {merchant.cashback}
        </div>
      ) : null}
    </div>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../audio";
import { colors, fonts } from "../brand";
import { Background } from "../components/Background";
import { CtaButton } from "../components/CtaButton";
import { KineticText } from "../components/KineticText";
import { LogoCard } from "../components/LogoCard";
import { Lockup } from "../components/Lockup";
import { copy, merchants, motion } from "../config";
import { lerp, pop } from "../motion";
import { SAFE, TEXT_CENTER_X } from "../safe";

// Scene 6: logo, CTA, URL button and disclaimer. Partner logos drift faintly
// behind. Everything is settled and still for the last motion.holdFrames.
export const Cta: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const holdFrom = duration - motion.holdFrames;
  const t = Math.min(frame, holdFrom); // drifting stops for the hold
  const logoP = pop(frame, 0);
  const discP = pop(frame, 16);
  const lockupW = 500;
  // Bands above and below the text block, so no copy sits over logos.
  const rows = [20, 1150, 1500, 1720];
  return (
    <AbsoluteFill>
      <Background variant="gradient" strength={0.5} />
      <AbsoluteFill style={{ opacity: 0.08 }}>
        {rows.map((y, r) => {
          const row = merchants.filter((_, i) => i % rows.length === r);
          const dir = r % 2 ? 1 : -1;
          return row.map((m, k) => {
            const pitch = 260;
            const len = Math.max(row.length * pitch, 1400);
            const x = ((((k * pitch + dir * t * 1.2 + r * 90) % len) + len) % len) - pitch;
            return (
              <div key={m.slug} style={{ position: "absolute", left: x, top: y }}>
                <LogoCard merchant={m} width={220} />
              </div>
            );
          });
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: TEXT_CENTER_X - lockupW / 2,
          top: SAFE.text.y + 40,
          opacity: logoP,
          transform: `translateY(${lerp(logoP, 40, 0)}px)`,
        }}
      >
        <Lockup width={lockupW} frame={frame} />
      </div>
      <div style={{ position: "absolute", left: SAFE.text.x, top: 640, width: SAFE.text.w }}>
        <KineticText text={copy.cta} frame={frame} startFrame={3} maxWidth={SAFE.text.w} maxHeight={260} minSize={88} maxSize={108} />
      </div>
      <div style={{ position: "absolute", left: SAFE.text.x, width: SAFE.text.w, top: 960, display: "flex", justifyContent: "center" }}>
        <CtaButton label={copy.url} frame={frame} enterAt={10} holdFrom={holdFrom} fontSize={66} />
      </div>
      <div
        style={{
          position: "absolute",
          left: SAFE.text.x,
          width: SAFE.text.w,
          bottom: 1920 - (SAFE.text.y + SAFE.text.h) + 10,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: 400,
          fontSize: 30,
          color: colors.text,
          opacity: 0.9 * discP,
        }}
      >
        {copy.disclaimer}
      </div>
      <Sfx name="chime" at={12} />
    </AbsoluteFill>
  );
};

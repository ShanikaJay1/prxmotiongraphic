import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../audio";
import { Background } from "../components/Background";
import { BrandGrid } from "../components/BrandGrid";
import { KineticText } from "../components/KineticText";
import { copy, merchants } from "../config";
import { useLayout } from "../layout-context";
import { SAFE } from "../safe";

// Scene 4 (hero): partner logos cascade in on a diagonal, then scroll like a
// feed while a few cards lift. Only merchants listed in config are shown.
export const BrandWall: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const layout = useLayout();
  const marquee = layout.brandWall === "marquee" || (layout.brandWall === "auto" && merchants.length > 12);
  const headlineTop = marquee ? 360 : SAFE.text.y + 10;
  const wallTop = marquee ? 590 : SAFE.text.y + 230;
  const length = Math.min(duration, 180);
  return (
    <AbsoluteFill>
      <Background variant="dark" />
      <div style={{ position: "absolute", left: SAFE.text.x, top: headlineTop, width: SAFE.text.w }}>
        <KineticText text={copy.wall} frame={frame} startFrame={2} maxWidth={SAFE.text.w} maxHeight={220} minSize={80} maxSize={96} />
      </div>
      <BrandGrid merchants={merchants} frame={frame} duration={length} top={wallTop} startFrame={6} />
      {[0, 2, 4, 6].map((slot) => (
        <Sfx key={slot} name="pop" at={6 + slot * 3 + 4} volume={0.55} />
      ))}
    </AbsoluteFill>
  );
};

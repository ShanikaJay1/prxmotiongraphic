import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../audio";
import { colors } from "../brand";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { LOCKUP_ASPECT, Lockup, lockupMarkCenter } from "../components/Lockup";
import { copy } from "../config";
import { EASE_IN } from "../motion";
import { SAFE, TEXT_CENTER_X } from "../safe";

// Scene 3: the mark pops in with one accent ring pulse, the wordmark resolves
// beside it, then the value line rises in underneath.
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const width = 680;
  const left = TEXT_CENTER_X - width / 2;
  const top = 400;
  const mark = lockupMarkCenter(width);
  const offset = TEXT_CENTER_X - (left + mark.x);
  const ring = interpolate(frame, [3, 30], [0, 1], { easing: EASE_IN, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringSize = width * 0.62 * (0.7 + ring * 0.9);
  const move = interpolate(frame, [10, 26], [0, 1], { easing: EASE_IN, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background variant="gradient" strength={0.55} />
      <div
        style={{
          position: "absolute",
          left: left + mark.x + offset * (1 - move) - ringSize / 2,
          top: top + mark.y - ringSize / 2,
          width: ringSize,
          height: ringSize,
          borderRadius: "50%",
          border: `8px solid ${colors.accent}`,
          opacity: ring > 0 ? (1 - ring) * 0.9 : 0,
          boxSizing: "border-box",
        }}
      />
      <div style={{ position: "absolute", left, top, width, height: width * LOCKUP_ASPECT }}>
        <Lockup width={width} frame={frame} markAt={0} wordAt={12} markOffsetX={offset} />
      </div>
      <div style={{ position: "absolute", left: SAFE.text.x, top: top + width * LOCKUP_ASPECT + 70, width: SAFE.text.w }}>
        <KineticText text={copy.reveal} frame={frame} startFrame={18} maxWidth={SAFE.text.w} maxHeight={420} minSize={88} maxSize={104} />
      </div>
      <Sfx name="pop" at={0} />
      <Sfx name="pop" at={12} volume={0.5} />
    </AbsoluteFill>
  );
};

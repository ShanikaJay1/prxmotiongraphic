import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../audio";
import { colors } from "../brand";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { tokenize } from "../components/text";
import { SAFE } from "../safe";

// Scene 1: the hook slams in word by word on solid violet. Every word is on
// screen (at 0.6 scale) from frame 0 so the first frame works as a cover.
export const Hook: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const words = tokenize(text).length;
  return (
    <AbsoluteFill>
      <Background variant="primary" />
      <div
        style={{
          position: "absolute",
          left: SAFE.text.x,
          width: SAFE.text.w,
          top: SAFE.focal.y,
          height: SAFE.text.y + SAFE.text.h - SAFE.focal.y - 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <KineticText
          text={text}
          frame={frame}
          mode="slam"
          stagger={2}
          maxWidth={SAFE.text.w}
          maxHeight={880}
          minSize={140}
          maxSize={180}
          maxWordsPerLine={2}
          lineHeight={1.02}
          color={colors.text}
          accentColor={colors.text}
        />
      </div>
      {Array.from({ length: words }, (_, i) => (
        <Sfx key={i} name="tick" at={i * 2} volume={0.6} />
      ))}
    </AbsoluteFill>
  );
};

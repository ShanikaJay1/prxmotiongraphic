import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../audio";
import { Background } from "../components/Background";
import { KineticText } from "../components/KineticText";
import { Receipt } from "../components/Receipt";
import { copy } from "../config";
import { lerp, pop } from "../motion";
import { SAFE, TEXT_CENTER_X } from "../safe";

// Scene 2: the question, and a receipt that pays nothing back.
export const Turn: React.FC = () => {
  const frame = useCurrentFrame();
  const r = pop(frame, 8, true);
  const width = 560;
  return (
    <AbsoluteFill>
      <Background variant="dark" />
      <div style={{ position: "absolute", left: SAFE.text.x, top: SAFE.text.y + 20, width: SAFE.text.w }}>
        <KineticText text={copy.turn} frame={frame} startFrame={2} maxWidth={SAFE.text.w} maxHeight={360} minSize={88} maxSize={110} />
      </div>
      <div
        style={{
          position: "absolute",
          left: TEXT_CENTER_X - width / 2,
          top: 760,
          transform: `translateY(${lerp(r, 700, 0)}px) rotate(${lerp(r, 6, -2)}deg)`,
        }}
      >
        <Receipt frame={frame} line={copy.receiptLine} lineAt={24} strikeAt={40} width={width} />
      </div>
      <Sfx name="tick" at={40} />
    </AbsoluteFill>
  );
};

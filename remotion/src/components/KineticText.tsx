import React, { useMemo } from "react";
import { colors, fonts } from "../brand";
import { lerp, pop } from "../motion";
import { fitLines } from "./text";

type Props = {
  text: string;
  frame: number;
  startFrame?: number;
  stagger?: number; // frames between words
  mode?: "slam" | "rise";
  maxWidth: number;
  maxHeight: number;
  minSize: number;
  maxSize: number;
  maxWordsPerLine?: number;
  lineHeight?: number;
  weight?: number;
  color?: string;
  accentColor?: string;
  align?: "center" | "left";
};

// Display type that animates word by word. "slam": each word springs from
// scale 0.6 to 1 and is legible from frame 0 (cover frame). "rise": each word
// springs up from below and fades in.
export const KineticText: React.FC<Props> = ({
  text,
  frame,
  startFrame = 0,
  stagger = 2,
  mode = "rise",
  maxWidth,
  maxHeight,
  minSize,
  maxSize,
  maxWordsPerLine,
  lineHeight = 1.05,
  weight = 800,
  color = colors.text,
  accentColor = colors.accent,
  align = "center",
}) => {
  const { size, lines } = useMemo(
    () =>
      fitLines(text, {
        maxWidth,
        maxHeight,
        minSize,
        maxSize,
        maxWordsPerLine,
        weight: String(weight),
        lineHeight,
      }),
    [text, maxWidth, maxHeight, minSize, maxSize, maxWordsPerLine, weight, lineHeight],
  );

  let index = 0;
  return (
    <div style={{ textAlign: align, lineHeight, fontSize: size }}>
      {lines.map((line, li) => (
        <div key={li} style={{ whiteSpace: "nowrap", height: size * lineHeight }}>
          {line.map((t, wi) => {
            const p = pop(frame, startFrame + index++ * stagger);
            const style: React.CSSProperties =
              mode === "slam"
                ? { transform: `scale(${lerp(p, 0.6, 1)})` }
                : { transform: `translateY(${lerp(p, size * 0.5, 0)}px)`, opacity: p };
            return (
              <span
                key={wi}
                style={{
                  display: "inline-block",
                  transformOrigin: "50% 60%",
                  fontFamily: t.accent ? fonts.accent : fonts.display,
                  fontWeight: t.accent ? 400 : weight,
                  letterSpacing: t.accent ? 0 : -0.02 * size,
                  color: t.accent ? accentColor : color,
                  marginRight: wi < line.length - 1 && !line[wi + 1].attach ? size * 0.26 : 0,
                  ...style,
                }}
              >
                {t.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

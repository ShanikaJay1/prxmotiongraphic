import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from "remotion";
import { resolveAsset } from "../assets";
import { Sfx } from "../audio";
import { colors, fonts, radius } from "../brand";
import { CountUp } from "../components/CountUp";
import { Placeholder } from "../components/Placeholder";
import { FloatingScreen, PhoneFrame } from "../components/PhoneFrame";
import { StepList } from "../components/StepList";
import { Background } from "../components/Background";
import { copy, exampleBalance } from "../config";
import { useLayout } from "../layout-context";
import { EASE_IN, lerp, pop } from "../motion";
import { SAFE, TEXT_CENTER_X } from "../safe";

// Source screens are 804 px wide. Where the "$XX.XX" total sits on the
// balance screen, in source pixels, so the example callout can cover it.
const SRC_W = 804;
const BALANCE_TOTAL = { top: 600, bottom: 790 };

const Screen: React.FC<{ file: string; width: number; scrollY: number }> = ({ file, width, scrollY }) => {
  const asset = resolveAsset(file);
  if (!asset) return <Placeholder file={file} style={{ width, height: "100%" }} />;
  return <Img src={asset.src} style={{ width, display: "block", transform: `translateY(${-scrollY}px)` }} />;
};

// Scene 5: the real web app UI, three numbered steps, and an example balance.
export const HowItWorks: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const phone = useLayout().uiFrame === "phone";
  const cardW = phone ? 410 : 450;
  const cardH = phone ? 720 : 690;
  const bezel = phone ? Math.round(cardW * 0.035) : 0;
  const screenW = cardW - bezel * 2;
  const scale = screenW / SRC_W;
  const left = TEXT_CENTER_X - cardW / 2;
  const top = SAFE.text.y + 10;

  const s = (f: number) => Math.round(duration * f);
  const starts = [s(0.1), s(0.27), s(0.44)];
  const swap = starts[2];
  const bubbleAt = swap + 3; // covers the template "$XX.XX" as the screen lands

  const enterP = pop(frame, 0, true);
  const swapP = interpolate(frame, [swap, swap + 9], [0, 1], { easing: EASE_IN, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const homeScroll = interpolate(frame, [10, swap], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bubble = pop(frame, bubbleAt);

  const screens = (
    <div style={{ position: "relative", width: screenW, height: "100%", overflow: "hidden", background: colors.background }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${-swapP * 100}%)` }}>
        <Screen file="screens/app-home.png" width={screenW} scrollY={homeScroll} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - swapP) * 100}%)` }}>
        <Screen file="screens/app-balance.png" width={screenW} scrollY={0} />
      </div>
    </div>
  );

  const bubbleTop = top + bezel + BALANCE_TOTAL.top * scale;
  const bubbleH = (BALANCE_TOTAL.bottom - BALANCE_TOTAL.top) * scale;

  return (
    <AbsoluteFill>
      <Background variant="dark" />
      <div
        style={{
          position: "absolute",
          left,
          top,
          perspective: 1400,
        }}
      >
        <div
          style={{
            transform: `translateY(${lerp(enterP, 900, 0)}px) rotateX(${lerp(enterP, 24, 0)}deg) rotateZ(${lerp(enterP, -4, 0)}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          {phone ? (
            <PhoneFrame width={cardW} height={cardH}>
              {screens}
            </PhoneFrame>
          ) : (
            <FloatingScreen width={cardW} height={cardH}>
              {screens}
            </FloatingScreen>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: left - 40,
          top: bubbleTop - 14,
          width: cardW + 80,
          height: bubbleH + 28,
          boxSizing: "border-box",
          borderRadius: radius.lg,
          background: colors.surface,
          border: `3px solid ${colors.primary}`,
          boxShadow: "0 30px 70px rgba(4, 2, 14, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          // Opaque from its first frame so the template figure never shows through.
          opacity: frame >= bubbleAt ? 1 : 0,
          transform: `translateY(${lerp(bubble, 40, 0)}px) scale(${lerp(bubble, 0.6, 1)})`,
        }}
      >
        <CountUp
          value={exampleBalance.amount}
          prefix={exampleBalance.currency}
          frame={frame}
          from={bubbleAt + 4}
          length={Math.max(12, s(0.22))}
          style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: 84, color: colors.success, letterSpacing: -2 }}
        />
        <span
          style={{
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 28,
            color: colors.text,
            background: colors.surfaceRaised,
            borderRadius: radius.sm,
            padding: "6px 14px",
          }}
        >
          {copy.exampleLabel}
        </span>
      </div>
      <div style={{ position: "absolute", left: SAFE.text.x, bottom: 1920 - (SAFE.text.y + SAFE.text.h), width: SAFE.text.w }}>
        <StepList steps={copy.steps} frame={frame} starts={starts} width={SAFE.text.w} fontSize={58} />
      </div>
      {starts.map((st, i) => (
        <Sfx key={i} name="tick" at={st + 8} />
      ))}
      <Sfx name="pop" at={bubbleAt} volume={0.6} />
    </AbsoluteFill>
  );
};

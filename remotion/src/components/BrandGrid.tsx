import React from "react";
import { Easing, interpolate } from "remotion";
import type { Merchant } from "../config";
import { useLayout } from "../layout-context";
import { lerp, pop } from "../motion";
import { SAFE } from "../safe";
import { LogoCard } from "./LogoCard";

type Props = {
  merchants: Merchant[];
  frame: number;
  duration: number;
  top: number; // y where the wall starts
  startFrame?: number;
};

const CASCADE_STEP = 3; // frames between cards on the diagonal
const LIFT = { up: 8, hold: 16, down: 10 };

// 0..1 lift envelope for a card lifted at frame `at`.
const liftAt = (frame: number, at: number) =>
  interpolate(frame, [at, at + LIFT.up, at + LIFT.up + LIFT.hold, at + LIFT.up + LIFT.hold + LIFT.down], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

const entrance = (frame: number, delay: number) => {
  const p = pop(frame, delay);
  return { opacity: p, transform: `translateY(${lerp(p, 90, 0)}px) scale(${lerp(p, 0.86, 1)})` };
};

const fadeMask = (dir: "x" | "y", a: number, b: number, size: number, fade: number) => {
  const side = dir === "x" ? "to right" : "to bottom";
  const mask = `linear-gradient(${side}, transparent ${a}px, #000 ${a + fade}px, #000 ${b - fade}px, transparent ${b}px)`;
  return { WebkitMaskImage: mask, maskImage: mask, [dir === "x" ? "width" : "height"]: size };
};

// The brand wall: a 3 column grid that cascades in then scrolls like a feed,
// or (more than 12 merchants) two counter-scrolling marquee rows.
export const BrandGrid: React.FC<Props> = (props) => {
  const layout = useLayout();
  const mode = layout.brandWall === "auto" ? (props.merchants.length > 12 ? "marquee" : "grid") : layout.brandWall;
  return mode === "grid" ? <Grid {...props} /> : <Marquee {...props} />;
};

const Grid: React.FC<Props> = ({ merchants, frame, duration, top, startFrame = 0 }) => {
  const cols = 3;
  const gap = 24;
  const cardW = Math.floor((SAFE.text.w - gap * (cols - 1)) / cols);
  const cardH = Math.round(cardW * 0.08 + (cardW - Math.round(cardW * 0.04) * 2) * 0.6);
  const rowH = cardH + gap + 18;
  const rows = Math.ceil(merchants.length / cols);
  const viewport = SAFE.text.y + SAFE.text.h - top;
  const maxScroll = Math.max(0, rows * rowH - viewport + 40);
  const scrollFrom = startFrame + 40;
  const scroll = interpolate(frame, [scrollFrom, Math.max(scrollFrom + 1, duration - 12)], [0, maxScroll], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // Lift a few cards that are on screen at the time.
  const lifts = [0.32, 0.55, 0.78].map((f, i) => {
    const at = Math.round(lerp(f, startFrame, duration));
    const s = interpolate(at, [scrollFrom, Math.max(scrollFrom + 1, duration - 12)], [0, maxScroll], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    });
    const visibleRow = Math.min(rows - 1, Math.floor((s + viewport * 0.35) / rowH) + (i % 2));
    return { index: Math.min(merchants.length - 1, visibleRow * cols + ((i + 1) % cols)), at };
  });

  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.text.x,
        top,
        width: SAFE.text.w,
        overflow: "hidden",
        ...fadeMask("y", 0, viewport, viewport, 40),
      }}
    >
      <div style={{ position: "absolute", left: 0, top: 30, transform: `translateY(${-scroll}px)` }}>
        {merchants.map((m, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const lift = lifts.filter((l) => l.index === i).reduce((a, l) => Math.max(a, liftAt(frame, l.at)), 0);
          return (
            <div
              key={m.slug}
              style={{
                position: "absolute",
                left: c * (cardW + gap),
                top: r * rowH,
                zIndex: lift > 0 ? 2 : 1,
                ...entrance(frame, startFrame + (r + c) * CASCADE_STEP),
              }}
            >
              <LogoCard merchant={m} width={cardW} lift={lift} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Marquee: React.FC<Props> = ({ merchants, frame, duration, top, startFrame = 0 }) => {
  const cardW = 340;
  const gap = 30;
  const pitch = cardW + gap;
  const cardH = Math.round(cardW * 0.08 + (cardW - Math.round(cardW * 0.04) * 2) * 0.6);
  const rowGap = 44;
  const speed = 2.6; // px per frame
  // Logos rest inside visual safe and clear of the brief's 96px right rail.
  const left = SAFE.visual.x;
  const right = 1080 - SAFE.brief.right;
  const rowsData = [merchants.filter((_, i) => i % 2 === 0), merchants.filter((_, i) => i % 2 === 1)];

  return (
    <div style={{ position: "absolute", left: 0, top, ...fadeMask("x", left, right, 1080, 70), height: cardH * 2 + rowGap + 80 }}>
      {rowsData.map((row, r) => {
        const length = row.length * pitch;
        const dir = r === 0 ? -1 : 1;
        const shift = dir * speed * (frame - startFrame) + (r === 0 ? 40 : -pitch / 2);
        const items = row.map((m, k) => {
          const x = ((((k * pitch + shift) % length) + length) % length) - pitch;
          return { m, k, x };
        });
        // Lift the card nearest the centre of the text box at each lift time.
        const lifts = [0.3, 0.52, 0.74]
          .map((f) => Math.round(lerp(f, startFrame, duration)))
          .filter((_, i) => i % 2 === r)
          .map((at) => {
            const s = dir * speed * (at - startFrame) + (r === 0 ? 40 : -pitch / 2);
            const target = SAFE.text.x + SAFE.text.w / 2 - cardW / 2;
            let best = 0;
            let bestDist = Infinity;
            row.forEach((_, k) => {
              const x = ((((k * pitch + s) % length) + length) % length) - pitch;
              if (Math.abs(x - target) < bestDist) {
                bestDist = Math.abs(x - target);
                best = k;
              }
            });
            return { k: best, at };
          });
        return (
          <div key={r} style={{ position: "absolute", left: 0, top: 30 + r * (cardH + rowGap), height: cardH + 40, width: 1080 }}>
            {items.map(({ m, k, x }) => {
              const initialX = ((((k * pitch + (r === 0 ? 40 : -pitch / 2)) % length) + length) % length) - pitch;
              const slot = Math.max(0, Math.round((initialX - left) / pitch));
              const lift = lifts.filter((l) => l.k === k).reduce((a, l) => Math.max(a, liftAt(frame, l.at)), 0);
              return (
                <div
                  key={m.slug}
                  style={{
                    position: "absolute",
                    left: x,
                    top: 0,
                    zIndex: lift > 0 ? 2 : 1,
                    ...entrance(frame, startFrame + (slot + r) * CASCADE_STEP),
                  }}
                >
                  <LogoCard merchant={m} width={cardW} lift={lift} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

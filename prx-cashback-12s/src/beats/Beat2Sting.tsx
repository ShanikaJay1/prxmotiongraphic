// Beat 2, 2.5-5.0s, frames 75-150: sting. Princess Polly moves into a list;
// ASOS and Cotton On slide in beside it, each with a $0.00 tag.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COPY, MERCHANTS, type MerchantId } from '../content';
import { BEAT1, BEAT2, HEADLINE_TOP, beat2Row } from '../layout';
import { DUR, EASE, STAGGER, TRAVEL, lerp, motion, prog, textMotion } from '../motion';
import { Banner, Headline } from '../parts';

const OUT = 58;
const HEADLINE_IN = 2;
/** The accent line lands as the Cotton On row settles. */
const ACCENT_AT = 36;
const ROWS: Array<{ id: MerchantId; inAt: number | null; tagAt: number }> = [
  { id: 'princessPolly', inAt: null, tagAt: 14 },
  { id: 'asos', inAt: 12, tagAt: 12 + DUR.fast },
  { id: 'cottonOn', inAt: 24, tagAt: 24 + DUR.fast },
];

export const Beat2Sting: React.FC = () => {
  const frame = useCurrentFrame();
  // Princess Polly translates from its cover position into row 1 (move curve, no pop).
  const m = prog(frame, 0, DUR.base, EASE.move);
  const from = BEAT1.banner;
  const to = beat2Row(0);
  const ppStyle: React.CSSProperties = {
    transformOrigin: '0 0',
    transform: `translate3d(${lerp(0, to.x - from.x, m)}px, ${lerp(0, to.y - from.y, m)}px, 0) scale(${lerp(1, to.w / from.w, m)})`,
  };
  const ppExit = motion(frame, { outAt: OUT, d: DUR.base, ease: EASE.enter, dx: -TRAVEL.lg, dy: 0 });

  return (
    <>
      <Headline
        top={HEADLINE_TOP}
        lines={COPY.beat2.lines}
        accent={COPY.beat2.accent}
        accentClass="c-fail"
        frame={frame}
        inAt={HEADLINE_IN}
        outAt={OUT}
        accentDelay={ACCENT_AT - (HEADLINE_IN + COPY.beat2.lines.length * STAGGER.wide)}
      />
      {ROWS.map((row, i) => {
        const rect = beat2Row(i);
        const out = OUT + i * STAGGER.base;
        const bannerMotion =
          row.inAt == null ? ppExit : motion(frame, { inAt: row.inAt, outAt: out, d: DUR.base, ease: EASE.enter, dx: TRAVEL.lg, dy: 0 });
        return (
          <React.Fragment key={row.id}>
            {row.inAt == null ? (
              <div className="abs" style={{ left: 0, top: 0, ...bannerMotion }}>
                <Banner merchant={MERCHANTS[row.id]} rect={from} style={ppStyle} />
              </div>
            ) : (
              <Banner merchant={MERCHANTS[row.id]} rect={rect} style={bannerMotion} />
            )}
            <div
              className="abs"
              style={{ left: rect.x + BEAT2.banner.w + BEAT2.tagGap, top: rect.y, ...textMotion(frame, { inAt: row.tagAt, outAt: out }) }}
            >
              <div className="zoom">
                <div className="zero-tag" data-zone="text">
                  {COPY.beat2.zeroTag}
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

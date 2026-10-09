// Beat 4, 9.0-12.0s, frames 270-360: action. The Receipt total rises and
// holds above the CTA; the last frames clear to the background so the loop
// cuts cleanly back to the frame-0 cover.
import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { COPY, TOTAL_CASHBACK_CENTS } from '../content';
import { AXIS_X, BEAT4 } from '../layout';
import { DUR, EASE, TRAVEL, lerp, motion, prog } from '../motion';
import { Cta, Headline, TotalPill } from '../parts';
import { TOTAL_IN_RECEIPT } from './Beat3Relief';

const OUT_VISUAL = 76;
const OUT_TEXT = 80;
const CTA_IN = 16;

export const Beat4Action: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = prog(frame, 0, DUR.base, EASE.move);
  const pillY = lerp(TOTAL_IN_RECEIPT.y, BEAT4.totalTop, rise);
  const lockupH = (BEAT4.lockup.w * 1053) / 2013;

  return (
    <>
      <div className="abs" data-zone="text" style={{ left: AXIS_X - BEAT4.lockup.w / 2, top: BEAT4.lockup.top, width: BEAT4.lockup.w, height: lockupH, ...motion(frame, { inAt: 6, outAt: OUT_VISUAL, d: DUR.base, ease: EASE.enter, dy: TRAVEL.md }) }}>
        <Img src={staticFile('brand/lockup.png')} alt="PRX Vault" style={{ width: '100%', height: '100%' }} />
      </div>

      <Headline top={BEAT4.headlineTop} lines={COPY.beat4.lines} accent={COPY.beat4.accent} accentClass="c-tan" frame={frame} inAt={12} outAt={OUT_TEXT} />

      <div className="abs" style={{ left: TOTAL_IN_RECEIPT.x, top: pillY, ...motion(frame, { outAt: OUT_VISUAL, d: DUR.base, dy: TRAVEL.md }) }}>
        <div className="zoom">
          <TotalPill label={COPY.beat3.totalLabel} cents={TOTAL_CASHBACK_CENTS} />
        </div>
      </div>

      <Cta top={BEAT4.ctaTop} label={COPY.beat4.cta} style={motion(frame, { inAt: CTA_IN, outAt: OUT_VISUAL, d: DUR.base, ease: EASE.enter, dy: TRAVEL.md })} />
    </>
  );
};

// Beat 3, 5.0-9.0s, frames 150-270: relief. The PRX Receipt is the hero:
// three line items cascade in, each amount counts up, then the total.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COPY, MERCHANTS, RECEIPT_ORDER, TOTAL_CASHBACK_CENTS } from '../content';
import { HEADLINE_TOP, RECEIPT, RECEIPT_X, S } from '../layout';
import { DUR, EASE, STAGGER, TRAVEL, motion, textMotion } from '../motion';
import { Headline, ReceiptItem, TotalPill, countUp } from '../parts';

const RECEIPT_IN = 8;
const OUT = 106;
const ITEM_IN = 22;
const itemIn = (i: number) => ITEM_IN + i * STAGGER.wide;
const countStart = (i: number) => itemIn(i) + DUR.fast;
export const TOTAL_COUNT_START = countStart(RECEIPT_ORDER.length - 1) + DUR.base;

/** Receipt geometry in app px (x2.5 on canvas). Kept explicit so the total's
 *  canvas position is known to beat 4. */
const PAD = 20;
const ITEM_H = 40;
const GAP = 10;
const TOTAL_GAP = 15;
const TOTAL_H = 64;
export const RECEIPT_APP_H = PAD + RECEIPT_ORDER.length * ITEM_H + (RECEIPT_ORDER.length - 1) * GAP + TOTAL_GAP + TOTAL_H + PAD;
/** Where the total pill rests on canvas inside the Receipt. */
export const TOTAL_IN_RECEIPT = {
  x: RECEIPT_X + PAD * S,
  y: RECEIPT.top + (PAD + RECEIPT_ORDER.length * ITEM_H + (RECEIPT_ORDER.length - 1) * GAP + TOTAL_GAP) * S,
};

export const Beat3Relief: React.FC = () => {
  const frame = useCurrentFrame();
  const shell = motion(frame, { inAt: RECEIPT_IN, outAt: OUT, d: DUR.slow, ease: EASE.enter, dy: TRAVEL.md });
  const pillIn = motion(frame, { inAt: RECEIPT_IN, d: DUR.slow, ease: EASE.enter, dy: TRAVEL.md });
  const receiptH = RECEIPT_APP_H * S;

  return (
    <>
      <Headline top={HEADLINE_TOP} lines={COPY.beat3.lines} accent={COPY.beat3.accent} accentClass="c-tan" frame={frame} inAt={2} outAt={OUT} />

      <div className="abs" style={{ left: 0, top: 0, ...shell }}>
        {/* Primary Block stand-in: the Receipt rests on a solid Primary base (no Block render in the system yet). */}
        <div
          className="abs"
          data-zone="visual"
          style={{
            left: RECEIPT_X,
            top: RECEIPT.top + RECEIPT.blockDepth,
            width: 300 * S,
            height: receiptH,
            background: 'var(--primary)',
            borderRadius: 40 * S,
          }}
        />
        <div className="abs" style={{ left: RECEIPT_X, top: RECEIPT.top }}>
          <div className="zoom">
            <div className="prx-offer receipt" data-zone="visual" style={{ padding: PAD, gap: GAP }}>
              {RECEIPT_ORDER.map((id, i) => (
                <ReceiptItem
                  key={id}
                  merchant={MERCHANTS[id]}
                  cents={countUp(frame, countStart(i), DUR.base, MERCHANTS[id].cashbackCents)}
                  style={textMotion(frame, { inAt: itemIn(i), outAt: OUT + i * STAGGER.tight })}
                />
              ))}
              <div className="receipt-total-slot" style={{ height: TOTAL_H, marginTop: TOTAL_GAP - GAP }} />
            </div>
          </div>
        </div>
      </div>

      {/* The total lives outside the Receipt so it can stay on into beat 4. */}
      <div className="abs" style={{ left: TOTAL_IN_RECEIPT.x, top: TOTAL_IN_RECEIPT.y, ...pillIn }}>
        <div className="zoom">
          <TotalPill label={COPY.beat3.totalLabel} cents={countUp(frame, TOTAL_COUNT_START, DUR.slow, TOTAL_CASHBACK_CENTS)} />
        </div>
      </div>
    </>
  );
};

import React, { useEffect } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { formatAud, CATEGORY, type Merchant } from './content';
import { ACCENT, ACCENT_HERO, AXIS_X, HEADLINE, ZONES, type Rect } from './layout';
import { EASE, prog, textMotion, STAGGER } from './motion';
import { PRX } from './prx';

/** bg_gradient (Violet -> Dark 1), the system's only gradient, bleeding to every edge. */
export const Background: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('brand/bg-gradient.svg')} style={{ width: '100%', height: '100%' }} />
  </AbsoluteFill>
);

type HeadlineProps = {
  top: number;
  lines: readonly string[];
  accent: string;
  accentClass: string;
  hero?: boolean;
  frame: number;
  inAt?: number;
  outAt?: number;
  /** Delay before the accent line enters, after the last plain line. */
  accentDelay?: number;
};

/** Centred headline on the text-safe axis; one Momo accent phrase on its own line. */
export const Headline: React.FC<HeadlineProps> = ({ top, lines, accent, accentClass, hero, frame, inAt, outAt, accentDelay = 0 }) => {
  const accentLine = hero ? ACCENT_HERO.line : ACCENT.line;
  const at = (i: number) => (inAt == null ? undefined : inAt + i * STAGGER.wide);
  const outFor = (i: number) => (outAt == null ? undefined : outAt + i * STAGGER.tight);
  return (
    <div className="headline" style={{ left: ZONES.adText.x, top, width: ZONES.adText.w }}>
      {lines.map((line, i) => (
        <div key={line} className="headline-line" style={{ height: HEADLINE.line }}>
          <span data-zone="text" style={textMotion(frame, { inAt: at(i), outAt: outFor(i) })}>
            {line}
          </span>
        </div>
      ))}
      <div className="headline-line" style={{ height: accentLine }}>
        <span
          data-zone="text"
          className={`accent ${hero ? 'accent-hero' : ''} ${accentClass}`}
          style={textMotion(frame, {
            inAt: inAt == null ? undefined : (at(lines.length) as number) + accentDelay,
            outAt: outFor(lines.length),
          })}
        >
          {accent}
        </span>
      </div>
    </div>
  );
};

/** A merchant's own banner, as provided. */
export const Banner: React.FC<{ merchant: Merchant; rect: Rect; style?: React.CSSProperties }> = ({ merchant, rect, style }) => (
  <div data-zone="text" className="abs" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, ...style }}>
    <Img className="banner" src={staticFile(merchant.banner)} alt={merchant.name} />
  </div>
);

/** Count from $0.00 up to `cents` over `dur` frames starting at `start`. */
export const countUp = (frame: number, start: number, dur: number, cents: number) =>
  Math.round(cents * prog(frame, start, dur, EASE.settle));

/** One Receipt line: merchant logo, name, category, cashback amount. App px (inside a zoom wrapper). */
export const ReceiptItem: React.FC<{ merchant: Merchant; cents: number; style?: React.CSSProperties }> = ({ merchant, cents, style }) => (
  <div className="receipt-item" style={style}>
    <div className="receipt-logo">
      <Img className="banner" src={staticFile(merchant.banner)} alt={merchant.name} />
    </div>
    <div className="receipt-text" data-zone="text">
      <p className="prx-offer-merchant">{merchant.name}</p>
      <p className="prx-offer-category">{CATEGORY}</p>
    </div>
    <span className="receipt-amount" data-zone="text">
      {formatAud(cents, '+')}
    </span>
  </div>
);

/** Receipt total. App px (inside a zoom wrapper). */
export const TotalPill: React.FC<{ label: string; cents: number }> = ({ label, cents }) => (
  <div className="total-pill" data-zone="text">
    <span className="total-label">{label}</span>
    <span className="total-amount">{formatAud(cents, '+')}</span>
  </div>
);

/** PRX.Button, primary, large, centred on the axis. */
export const Cta: React.FC<{ top: number; label: string; style?: React.CSSProperties }> = ({ top, label, style }) => (
  <div className="abs cta" style={{ left: AXIS_X, top, transform: 'translateX(-50%)' }}>
    <div style={style}>
      <div className="zoom" data-zone="text" style={{ display: 'inline-block' }}>
        <PRX.Button variant="primary" size="large">
          {label}
        </PRX.Button>
      </div>
    </div>
  </div>
);

/** Draft-only safe-area overlay (ad variant). Never rendered in the export. */
export const SafeAreaOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const box = (r: Rect, border: string, extra: React.CSSProperties = {}) => ({
    position: 'absolute' as const,
    left: r.x,
    top: r.y,
    width: r.w,
    height: r.h,
    boxSizing: 'border-box' as const,
    border,
    ...extra,
  });
  const label: React.CSSProperties = { font: '600 22px/1.3 Manrope, sans-serif', color: '#00e5ff' };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={box(ZONES.visual, '3px dashed rgba(255,214,0,0.9)')} />
      <div style={box(ZONES.focal, '3px dotted rgba(255,255,255,0.7)')} />
      <div style={box(ZONES.adText, '3px solid rgba(0,229,255,0.95)')} />
      <div style={box(ZONES.rail, 'none', { background: 'rgba(255,40,80,0.35)' })} />
      <div style={{ position: 'absolute', left: 24, top: 24, ...label }}>
        <div>── Ad text safe x65–850 y270–1250</div>
        <div style={{ color: 'rgba(255,214,0,1)' }}>- - Visual safe x60–1020 y240–1680</div>
        <div style={{ color: '#fff' }}>··· Focal x90–850 y420–1440</div>
        <div style={{ color: 'rgba(255,90,120,1)' }}>▇ Rail zone x≥850 y≥1152</div>
        <div style={{ color: '#fff' }}>f {String(frame).padStart(3, '0')}  ·  DRAFT</div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * QA probe: logs every [data-zone] element's on-canvas rect and effective
 * opacity for this frame, so scripts/render.mjs can check zones from the
 * real DOM. Only mounted when the qa prop is set.
 */
export const QaProbe: React.FC<{ rootId: string }> = ({ rootId }) => {
  const frame = useCurrentFrame();
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const origin = root.getBoundingClientRect();
    const scale = origin.width > 0 ? origin.width / 1080 : 1;
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-zone]')).map((el) => {
      let opacity = 1;
      for (let n: HTMLElement | null = el; n && n !== root; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      const r = el.getBoundingClientRect();
      return {
        zone: el.dataset.zone,
        label: (el.textContent || el.querySelector('img')?.alt || '').trim().slice(0, 40),
        opacity: Number(opacity.toFixed(3)),
        x: (r.left - origin.left) / scale,
        y: (r.top - origin.top) / scale,
        w: r.width / scale,
        h: r.height / scale,
      };
    });
    console.log(`QA|${frame}|${JSON.stringify(items)}`);
  }, [frame, rootId]);
  return null;
};

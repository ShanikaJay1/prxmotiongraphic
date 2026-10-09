import { measureText } from "@remotion/layout-utils";
import { fonts } from "../brand";

// attach: no space before this token (punctuation right after an accent).
export type Token = { text: string; accent: boolean; attach?: boolean };

// "So why aren't you getting *paid back*?" -> words, accent words flagged.
export const tokenize = (text: string): Token[] => {
  const out: Token[] = [];
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    if (!part) return;
    const accent = part.startsWith("*") && part.endsWith("*");
    const clean = accent ? part.slice(1, -1) : part;
    const startsTight = !accent && out.length > 0 && !/^\s/.test(clean);
    clean
      .split(/\s+/)
      .filter(Boolean)
      .forEach((w, i) => out.push({ text: w, accent, attach: i === 0 && startsTight }));
  });
  return out;
};

type FitOptions = {
  maxWidth: number;
  maxHeight: number;
  minSize: number;
  maxSize: number;
  weight: string;
  lineHeight: number;
  maxWordsPerLine?: number;
};

const width = (t: Token, size: number, weight: string) =>
  measureText({
    text: t.text,
    fontFamily: t.accent ? fonts.accent.split(",")[0].replace(/'/g, "") : fonts.displayFamily,
    fontWeight: t.accent ? "400" : weight,
    fontSize: size,
    letterSpacing: t.accent ? "0px" : `${-0.02 * size}px`,
  }).width;

// Greedy line breaking at the largest size that fits the box.
export const fitLines = (text: string, o: FitOptions) => {
  const tokens = tokenize(text);
  for (let size = o.maxSize; size >= o.minSize; size -= 2) {
    const space = size * 0.26;
    const lines: Token[][] = [];
    let line: Token[] = [];
    let lineWidth = 0;
    let fits = true;
    for (const t of tokens) {
      const w = width(t, size, o.weight);
      if (w > o.maxWidth) fits = false;
      const next = line.length ? lineWidth + (t.attach ? 0 : space) + w : w;
      if (line.length && !t.attach && (next > o.maxWidth || line.length >= (o.maxWordsPerLine ?? 99))) {
        lines.push(line);
        line = [t];
        lineWidth = w;
      } else {
        line.push(t);
        lineWidth = next;
      }
    }
    if (line.length) lines.push(line);
    if (fits && lines.length * size * o.lineHeight <= o.maxHeight) return { size, lines };
    if (size - 2 < o.minSize) return { size, lines };
  }
  return { size: o.minSize, lines: [tokens] };
};

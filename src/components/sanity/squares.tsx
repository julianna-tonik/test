"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { easeOut } from "./shared";

/**
 * Square-grid illustrations in the Vibe Fixer language (chaos → order).
 * Cells are filled; they "print" into place in a left-to-right wave.
 * Bright outline = what the request changed.
 */
type Tone = "base" | "new" | "changed";
type Cell = { x: number; y: number; w: number; h: number; tone: Tone };

const TONE: Record<Tone, { fill: string; stroke: string }> = {
  base: { fill: "#2d2d2d", stroke: "#4a4a4a" },
  new: { fill: "#3d3d3d", stroke: "#888888" },
  changed: { fill: "#5a5a5a", stroke: "#efefef" },
};

const C = 16;
const X = 112;
const W = 22;

function band(o: Cell[], ox: number, oy: number, cols: number, rows: number, skip: (k: number, r: number) => boolean = () => false, tone: Tone = "base") {
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) if (!skip(k, r)) o.push({ x: ox + k * C, y: oy + r * C, w: C, h: C, tone });
}
const block = (o: Cell[], x: number, y: number, w: number, h: number, tone: Tone = "base") => o.push({ x, y, w, h, tone });

export const PAGES: (() => Cell[])[] = [
  // 01 event page
  () => { const o: Cell[] = []; band(o, X, 8, W, 3); band(o, X, 62, W, 2, (k) => k % 6 === 5); band(o, X, 100, 16, 1); band(o, X, 116, 12, 1); block(o, X, 140, 6 * C, 2 * C); block(o, X + 7 * C, 140, 6 * C, 2 * C); block(o, X + 14 * C, 140, 8 * C, 2 * C); band(o, X, 180, 16, 1); block(o, X + 17 * C, 180, 5 * C, C, "new"); return o; },
  // 02 report landing with gated form
  () => { const o: Cell[] = []; band(o, X, 8, W, 2); block(o, X, 46, 6 * C, 3 * C); block(o, X + 8 * C, 46, 6 * C, 3 * C); block(o, X + 16 * C, 46, 6 * C, 3 * C); band(o, X, 106, W, 2, (k, r) => r === 1 && k > 13); band(o, X, 148, 12, 2); block(o, X + 13 * C, 148, 9 * C, 2 * C, "changed"); return o; },
  // 03 homepage edit
  () => { const o: Cell[] = []; band(o, X, 8, W, 1); band(o, X, 24, W, 2, () => false, "changed"); band(o, X, 64, W, 1, (k) => k % 4 === 3, "changed"); band(o, X, 88, W, 3); block(o, X, 144, W * C, 2 * C, "changed"); band(o, X, 184, W, 1); return o; },
  // 04 A/B
  () => { const o: Cell[] = []; const pg = (ox: number, b: boolean) => { band(o, ox, 8, 9, 2, () => false, b ? "changed" : "base"); band(o, ox, 46, 9, 1, (k) => k % 3 === 2); band(o, ox, 70, 9, 3); band(o, ox, 126, 9, 2, (k, r) => r === 1 && k > 5); block(o, ox, 166, 9 * C, C, b ? "changed" : "base"); }; pg(24, false); pg(300, true); return o; },
];

const LOOSE = [[6, 26], [28, 8], [44, 54], [12, 92], [38, 120], [60, 84], [70, 26], [6, 156], [50, 166], [82, 136], [88, 56], [28, 70]];

export function SquaresIllustration({
  index,
  active,
  loose = false,
  extra,
}: {
  index: number;
  active: boolean;
  loose?: boolean;
  extra?: React.ReactNode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-25% 0px" });
  const reduce = useReducedMotion();
  const built = reduce || seen || active;
  const cells = PAGES[index]();
  const minX = Math.min(...cells.map((c) => c.x));

  return (
    <svg ref={ref} viewBox="0 0 480 204" fill="none" className="block h-auto w-full">
      {extra}
      {loose &&
        LOOSE.map(([x, y], i) => (
          <motion.rect
            key={`l${i}`}
            x={x + 0.5}
            y={y + 0.5}
            width={10}
            height={10}
            fill="#2d2d2d"
            stroke="#555"
            initial={false}
            animate={built ? { opacity: 0, x: 40 } : { opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: easeOut, delay: i * 0.03 }}
          />
        ))}
      {cells.map((c, i) => (
        <motion.rect
          key={i}
          x={c.x + 0.5}
          y={c.y + 0.5}
          width={c.w}
          height={c.h}
          fill={TONE[c.tone].fill}
          stroke={TONE[c.tone].stroke}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={false}
          animate={built ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.55 }}
          transition={{ duration: 0.7, ease: easeOut, delay: built ? ((c.x - minX) * 1.4 + c.y * 1.1) / 1000 : 0 }}
        />
      ))}
    </svg>
  );
}

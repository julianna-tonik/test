"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { easeOut } from "./shared";
import { IdScope, useScopedId } from "./id-scope";

/**
 * Example-request illustrations in the Vibe Fixer video language:
 * the page grid is always there (outlines only) and the request plays as an
 * event on top of it, in a loop.
 * Selection runs along the blocks' own edge (no extra frame), with small nodes —
 * dashed = AI is working on it, solid light = protected by your rules,
 * grey edge = changed.
 */

const D = 7; // loop length (s)
const RESULT = 6; // moment shown for reduced motion
const C = 12; // grid cell
const BG = "#212121";
const GRID = "#424242";
const CHANGED_CELL = "#5a5a5a";
const CHANGED_EDGE = "#9a9a9a";
const SEL = "#dcdcdc";
const NODE_FILL = "#4a4a4a";
const MUTED = "#888";
const io = [0.65, 0, 0.35, 1] as const;

type V = number | string;
type Track = [number, V][];
type Box = [x: number, y: number, cols: number, rows: number];

/** a → b between t0 and t1, held until the reset (hidden by the scene fade). */
/** a → b between t0 and t1; at the end of the loop it returns to a (while moved things are hidden, see G). */
const ev = (a: V, b: V, t0: number, t1: number): Track => [[0, a], [t0, a], [t1, b], [6.25, b], [6.5, a], [D, a]];
/** a → b, held until the loop restarts (for things that are already hidden by then). */
const stay = (a: V, b: V, t0: number, t1: number): Track => [[0, a], [t0, a], [t1, b], [6.9, b], [6.95, a], [D, a]];
/** Things that moved switch off where they ended, go back unseen, and switch on again at their start. */
const HIDE_RESET: Track = [[0, 1], [6.05, 1], [6.25, 0], [6.55, 0], [6.85, 1], [D, 1]];
const MOVES = ["x", "y", "scale", "scaleX", "scaleY"];
/** Fade in at t0, out at t1. */
const pulse = (t0: number, t1: number, v: V = 1, a: V = 0): Track => [[0, a], [t0, a], [t0 + 0.3, v], [t1, v], [t1 + 0.3, a], [D, a]];
/** Visible from t0 until the reset. */
const show = (t0: number, d = 0.4) => ev(0, 1, t0, t0 + d);

const valueAt = (pts: Track, t: number) => pts.reduce<V>((v, p) => (p[0] <= t ? p[1] : v), pts[0][1]);

const Ctx = createContext({ on: false, reduce: false });

function useLoop(tracks: Record<string, Track>) {
  const { on, reduce } = useContext(Ctx);
  const animate: Record<string, V | V[]> = {};
  const transition: Record<string, object> = {};
  for (const [k, pts] of Object.entries(tracks)) {
    if (on) {
      animate[k] = pts.map((p) => p[1]);
      transition[k] = { duration: D, times: pts.map((p) => p[0] / D), ease: io, repeat: Infinity };
    } else {
      animate[k] = reduce ? valueAt(pts, RESULT) : pts[0][1];
      transition[k] = { duration: 0.5, ease: easeOut };
    }
  }
  return { initial: false as const, animate, transition };
}

type GProps = React.ComponentProps<typeof motion.g> & { t: Record<string, Track> };
function G({ t, ...rest }: GProps) {
  const moves = !t.opacity && Object.entries(t).some(([k, pts]) => MOVES.includes(k) && pts.some(([, v]) => v !== pts[0][1]));
  return <motion.g {...useLoop(moves ? { ...t, opacity: HIDE_RESET } : t)} {...rest} />;
}
type RProps = React.ComponentProps<typeof motion.rect> & { t: Record<string, Track> };
function R({ t, ...rest }: RProps) {
  return <motion.rect {...useLoop(t)} {...rest} />;
}

const cellsPath = (x: number, y: number, cols: number, rows: number) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) d += `M${x + k * C + 0.5} ${y + r * C + 0.5}h${C}v${C}h${-C}Z`;
  return d;
};

const rr = (x: number, y: number, w: number, h: number) => `M${x + 0.5} ${y + 0.5}h${w}v${h}h${-w}Z`;

/** Grid block; the background fill keeps overlapping outlines clean when blocks move. */
function Cells({ x, y, cols, rows, stroke = GRID }: { x: number; y: number; cols: number; rows: number; stroke?: string }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={cols * C} height={rows * C} fill={BG} />
      <path d={cellsPath(x, y, cols, rows)} stroke={stroke} strokeWidth="1" fill="none" />
    </>
  );
}

/** Small square node, as on the Vibe Fixer selections. */
function Node({ x, y }: { x: number; y: number }) {
  return <rect x={x - 2} y={y - 2} width="5" height="5" fill={NODE_FILL} stroke="#8a8a8a" strokeWidth="0.75" />;
}

/** Highlight running on the block's own outer edge, with nodes on corners (and mid-edges on wide blocks). */
function Edge({ x, y, cols, rows, t, dashed = false, color = SEL, nodes = true }: { x: number; y: number; cols: number; rows: number; t: Track; dashed?: boolean; color?: string; nodes?: boolean }) {
  const w = cols * C, h = rows * C;
  const x0 = x + 0.5, y0 = y + 0.5;
  const pts: [number, number][] = [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]];
  if (cols >= 8) pts.push([x0 + Math.round(w / 2 / C) * C, y0], [x0 + Math.round(w / 2 / C) * C, y0 + h]);
  return (
    <G t={{ opacity: t }}>
      <rect x={x0} y={y0} width={w} height={h} stroke={color} strokeWidth="1" strokeDasharray={dashed ? "4 3" : undefined} fill="none" />
      {nodes && pts.map(([px, py], i) => <Node key={i} x={px} y={py} />)}
    </G>
  );
}

/** "This part changed": cells lift a step, edge turns light grey. */
function Changed({ x, y, cols, rows, t }: { x: number; y: number; cols: number; rows: number; t: Track }) {
  return (
    <G t={{ opacity: t }}>
      <path d={cellsPath(x, y, cols, rows)} stroke={CHANGED_CELL} strokeWidth="1" fill="none" />
      <rect x={x + 0.5} y={y + 0.5} width={cols * C} height={rows * C} stroke={CHANGED_EDGE} strokeWidth="1" fill="none" />
    </G>
  );
}

/** Light sweep across the finished result — the VC-1 glow. */
function Glint({ id: local, boxes, at = 5 }: { id: string; boxes: Box[]; at?: number }) {
  const id = useScopedId(local);
  return (
    <>
      <defs>
        <linearGradient id={`g${id}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`m${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="204">
          <R t={{ x: [[0, -180], [at, -180], [at + 1.2, 500], [D, 500]] }} y={0} width={140} height={204} fill={`url(#g${id})`} />
        </mask>
      </defs>
      <path mask={`url(#m${id})`} d={boxes.map(([bx, by, bc, br]) => rr(bx, by, bc * C, br * C)).join("")} stroke="#b0b0b0" strokeWidth="1" fill="none" />
    </>
  );
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={SEL} strokeWidth="0.75" fill="none">
      <rect x={x + 0.5} y={y + 3.5} width="7" height="5.5" />
      <path d={`M${x + 2} ${y + 3.5}v-1.2a2 2 0 0 1 4 0v1.2`} />
    </g>
  );
}

/** The scene itself stays on; what changed switches off on its own at the end of the loop. */
const FADE: Track = [[0, 1], [D, 1]];

/* ───────────────────────── 01 · assembled from what you already have ───────────────────────── */

function SceneEvent() {
  const L = 16, P = 272, dx = P - L;
  const picks = [
    // evenly spaced inside the page frame: nav at the top, footer flush at the bottom
    { y: 20, cols: 16, rows: 3, to: 43 },
    { y: 64, cols: 8, rows: 3, to: 90 },
    { y: 108, cols: 10, rows: 3, to: 137 },
    { y: 184, cols: 16, rows: 1, to: 184 },
  ];
  return (
    <G t={{ opacity: FADE }}>

      {/* library */}
      <Cells x={L} y={20} cols={16} rows={3} />
      <Cells x={L} y={64} cols={8} rows={3} />
      <Cells x={L + 9 * C} y={64} cols={7} rows={3} />
      <Cells x={L} y={108} cols={10} rows={3} />
      <Cells x={L + 11 * C} y={108} cols={5} rows={3} />
      <Cells x={L} y={152} cols={6} rows={2} />
      <Cells x={L + 7 * C} y={152} cols={9} rows={2} />
      <Cells x={L} y={184} cols={16} rows={1} />

      {/* page from the template: frame + nav */}
      <rect x={P + 0.5} y={20.5} width={16 * C} height={176} stroke="#333" fill="none" />
      <Cells x={P} y={20} cols={16} rows={1} />

      {/* AI picks a section: selected on its edge, a copy travels into the page */}
      {picks.map((p, i) => {
        const s = 0.8 + i * 1.2;
        return (
          // at the end the copy just switches off in the page; it only jumps back once it is invisible
          <G key={i} t={{ x: stay(0, dx, s + 0.6, s + 1.4), y: stay(0, p.to - p.y, s + 0.6, s + 1.4), opacity: [[0, 0], [s, 0], [s + 0.3, 1], [6.0, 1], [6.4, 0], [D, 0]] }}>
            <rect x={L + 0.5} y={p.y + 0.5} width={p.cols * C} height={p.rows * C} fill={BG} />
            <path d={cellsPath(L, p.y, p.cols, p.rows)} stroke={CHANGED_CELL} strokeWidth="1" fill="none" />
            <Edge x={L} y={p.y} cols={p.cols} rows={p.rows} dashed t={pulse(s, s + 1.4)} />
            <Edge x={L} y={p.y} cols={p.cols} rows={p.rows} color={CHANGED_EDGE} nodes={false} t={show(s + 1.5)} />
          </G>
        );
      })}

      <Glint id="event" at={5.3} boxes={[[P, 20, 16, 1], ...picks.map((p): Box => [P, p.to, p.cols, p.rows])]} />

    </G>
  );
}

/* ───────────────────────── 02 · findings first, gated download, staging ───────────────────────── */

function SceneReport() {
  const X = 24, W = 20;
  return (
    <G t={{ opacity: FADE }}>
      <Cells x={X} y={6} cols={W} rows={1} />
      <Cells x={X} y={24} cols={W} rows={2} />

      {/* customer proof drops a slot, findings move to the top */}
      <G t={{ y: ev(0, 44, 1.2, 2) }}>
        <Cells x={X} y={56} cols={W} rows={3} />
      </G>
      <G t={{ y: ev(0, -44, 1.2, 2) }}>
        <Cells x={X} y={100} cols={W} rows={3} />
        <G t={{ opacity: pulse(1.1, 1.9) }}>
          <rect x={X + 0.5} y={100.5} width={W * C} height={3 * C} fill="#2c2c2c" />
          <path d={cellsPath(X, 100, W, 3)} stroke="#555" strokeWidth="1" fill="none" />
        </G>
        <Changed x={X} y={100} cols={W} rows={3} t={show(2)} />
        <Edge x={X} y={100} cols={W} rows={3} dashed t={pulse(0.6, 2.0)} />
      </G>

      {/* gated report: dims and locks behind the form, opens after the email */}
      <G t={{ opacity: [[0, 1], [2.4, 1], [2.8, 0.3], [4.1, 0.3], [4.4, 1], [D, 1]] }}>
        <Cells x={X} y={164} cols={W} rows={3} />
      </G>
      <Changed x={X} y={164} cols={W} rows={3} t={show(4.2)} />
      <G t={{ opacity: [[0, 0], [2.6, 0], [2.9, 1], [4.0, 1], [4.3, 0], [D, 0]] }}>
        <rect x={X + (W * C) / 2 - 9.5} y={172.5} width="20" height="20" fill={BG} stroke="none" />
        <g transform={`translate(${X + (W * C) / 2 - 4} 176) scale(1.3)`}>
          <Lock x={0} y={0} />
        </g>
      </G>

      {/* form: an email field (typed line fills it) + submit */}
      <G t={{ opacity: show(2.4) }}>
        <rect x={X + 0.5} y={144.5} width={15 * C - 4} height={C} fill={BG} stroke={CHANGED_EDGE} />
        <R t={{ scaleX: ev(0, 1, 3.0, 3.8) }} x={X + 5} y={149} width={100} height={3} fill="#777" style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }} />
        <R t={{ fill: ev("#2a2a2a", "#5a5a5a", 3.85, 4.05) }} x={X + 15 * C + 0.5} y={144.5} width={5 * C} height={C} stroke={CHANGED_EDGE} />
      </G>

      {/* staging preview */}
      <G t={{ opacity: show(4.6, 0.5), x: ev(-24, 0, 4.6, 5.3) }}>
        <line x1="274" y1="100.5" x2="306" y2="100.5" stroke={MUTED} strokeWidth="0.75" strokeDasharray="2 3" />
        <g stroke={CHANGED_EDGE} strokeWidth="0.75" fill="none">
          <rect x="318.5" y="24.5" width="138" height="150" />
          <rect x="326.5" y="32.5" width="122" height="6" />
          <rect x="326.5" y="44.5" width="122" height="14" />
          <rect x="326.5" y="64.5" width="122" height="22" />
          <rect x="326.5" y="92.5" width="122" height="22" />
          <rect x="326.5" y="120.5" width="122" height="7" />
          <rect x="326.5" y="133.5" width="122" height="33" />
        </g>
        <Node x={318.5} y={24.5} />
        <Node x={456.5} y={24.5} />
        <Node x={318.5} y={174.5} />
        <Node x={456.5} y={174.5} />
      </G>

      <Glint id="report" boxes={[[X, 6, W, 1], [X, 24, W, 2], [X, 56, W, 3], [X, 100, W, 3], [X, 164, W, 3]]} at={5.1} />
    </G>
  );
}

/* ───────────────────────── 03 · change only what was asked ───────────────────────── */

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** VC-3 style data noise over a block, cleared left → right. */
function noise(seed: number, cols: number, rows: number, t0: number, t1: number) {
  const r = rng(seed);
  const out: { k: number; row: number; fill: string; t: Track }[] = [];
  for (let row = 0; row < rows; row++)
    for (let k = 0; k < cols; k++) {
      const g = Math.round(48 + r() * 120);
      const peak = 0.35 + r() * 0.55;
      const a = t0 + r() * 0.25, b = t1 + (k / cols) * 0.4 + r() * 0.15;
      out.push({ k, row, fill: `rgb(${g},${g},${g})`, t: [[0, 0], [a, 0], [a + 0.15, peak], [a + 0.5, peak * 0.4], [a + 0.75, peak], [b, peak * 0.6], [b + 0.2, 0], [D, 0]] });
    }
  return out;
}

const NOISE_HOME = noise(7, 30, 3, 1.5, 2.5);
const NOISE_B = noise(11, 14, 3, 1.7, 2.3);

function SceneHomepage() {
  const X = 60, W = 30;
  return (
    <G t={{ opacity: FADE }}>
      {/* protected by your rules: navigation + legal */}
      <Cells x={X} y={6} cols={W} rows={1} />
      <Cells x={X} y={178} cols={W} rows={1} />
      <Edge x={X} y={6} cols={W} rows={1} t={show(0.4)} />
      <Edge x={X} y={178} cols={W} rows={1} t={show(0.4)} />
      <G t={{ opacity: show(0.4) }}>
        <Lock x={X + W * C + 10} y={6} />
        <Lock x={X + W * C + 10} y={178} />
      </G>

      {/* hero headline: replaced */}
      <Cells x={X} y={26} cols={W} rows={3} />
      {NOISE_HOME.map((n, i) => (
        <R key={i} t={{ opacity: n.t }} x={X + n.k * C + 1} y={26 + n.row * C + 1} width={C - 1} height={C - 1} fill={n.fill} />
      ))}
      <Changed x={X} y={26} cols={W} rows={3} t={show(2.8)} />
      <Edge x={X} y={26} cols={W} rows={3} dashed t={pulse(1.2, 2.8)} />

      {/* product tour slides down, customer logos move above it */}
      <G t={{ y: ev(0, 20, 3.4, 4.2) }}>
        <Cells x={X} y={70} cols={W} rows={3} />
      </G>
      <G t={{ y: ev(0, -44, 3.4, 4.2) }}>
        <Cells x={X} y={114} cols={W} rows={1} />
        <Changed x={X} y={114} cols={W} rows={1} t={show(4.2)} />
        <Edge x={X} y={114} cols={W} rows={1} dashed t={pulse(3.0, 4.2)} />
      </G>

      {/* quote: swapped */}
      <Cells x={X} y={134} cols={W} rows={3} />
      <R t={{ scaleX: ev(0, 1, 4.8, 5.4) }} x={X + 0.5} y={134.5} width={W * C} height={36} fill="#2a2a2a" style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }} />
      <Changed x={X} y={134} cols={W} rows={3} t={show(5.3)} />
      <Edge x={X} y={134} cols={W} rows={3} dashed t={pulse(4.5, 5.5)} />

      <Glint id="home" boxes={[[X, 26, W, 3], [X, 70, W, 1], [X, 90, W, 3], [X, 134, W, 3]]} at={5.4} />
    </G>
  );
}

/* ───────────────────────── 04 · split into A/B and keep measuring ───────────────────────── */

const SPLIT = [0.5, 1.3] as const;

/** Constant visitor stream: half goes to A, half to B; some convert on the CTA. */
// eight visitors, split 50/50: three of B's four convert, one of A's
const VISITORS = Array.from({ length: 8 }).map((_, j) => {
  const toB = j % 2 === 1;
  const converts = toB ? [1, 3, 7].includes(j) : [2].includes(j);
  return { s: 1.6 + j * 0.4, toB, converts };
});
const TRAVEL = { down: 0.95, across: 0.75 };
const METER = 8;

function Page({ variant }: { variant: "A" | "B" }) {
  const b = variant === "B";
  const conv = VISITORS.filter((v) => v.toB === b && v.converts);
  return (
    <>
      <Cells x={0} y={6} cols={14} rows={1} />
      <Cells x={0} y={26} cols={14} rows={3} />
      {/* same page; B's content block is a row shorter */}
      <Cells x={0} y={70} cols={14} rows={b ? 3 : 4} />
      <Cells x={0} y={126} cols={5} rows={1} />
      <Cells x={0} y={146} cols={14} rows={1} />
      {b && (
        <>
          {/* new headline: noise, then settles */}
          {NOISE_B.map((n, i) => (
            <R key={i} t={{ opacity: n.t }} x={n.k * C + 1} y={26 + n.row * C + 1} width={C - 1} height={C - 1} fill={n.fill} />
          ))}
          <Changed x={0} y={26} cols={14} rows={3} t={show(2.5)} />
          <Edge x={0} y={26} cols={14} rows={3} dashed t={pulse(1.4, 2.5)} />
          {/* new CTA: wider */}
          <G t={{ opacity: show(2.2) }}>
            <Cells x={5 * C} y={126} cols={3} rows={1} />
          </G>
          <Changed x={0} y={126} cols={8} rows={1} t={show(2.4)} />
          <Edge x={0} y={126} cols={8} rows={1} dashed t={pulse(1.7, 2.5)} />
        </>
      )}
      <G t={{ opacity: show(SPLIT[1]) }}>
        {Array.from({ length: METER }).map((_, k) => (
          <rect key={k} x={14.5 + k * 10} y={176.5} width="7" height="7" stroke={GRID} strokeWidth="1" fill="none" />
        ))}
        {conv.map((v, n) => (
          <R key={n} t={{ opacity: show(v.s + TRAVEL.down + TRAVEL.across, 0.2) }} x={15.5 + n * 10} y={177.5} width="5" height="5" fill={b ? SEL : MUTED} />
        ))}
      </G>
    </>
  );
}

function SceneAB() {
  const ax = 40, bx = 272, cx = 156;
  return (
    <G t={{ opacity: FADE }}>
      <G t={{ opacity: show(SPLIT[1]) }}>
        <line x1="240.5" y1="10" x2="240.5" y2="160" stroke={GRID} strokeWidth="1" strokeDasharray="2 3" />
      </G>

      <G t={{ x: ev(cx, ax, ...SPLIT) }}>
        <Page variant="A" />
      </G>
      <G t={{ x: ev(cx, bx, ...SPLIT) }}>
        <Page variant="B" />
      </G>

      {/* visitors: down the split, into a page; converters reach the CTA and light it */}
      {VISITORS.map((v, j) => {
        const page = v.toB ? bx : ax;
        const endX = v.converts ? page + 30 : page + (v.toB ? 120 : 48);
        const endY = v.converts ? 132.5 : 94.5;
        return (
          <G
            key={j}
            t={{
              x: [[0, 240.5], [v.s + TRAVEL.down, 240.5], [v.s + TRAVEL.down + TRAVEL.across, endX], [D, endX]],
              y: [[0, 6], [v.s, 6], [v.s + TRAVEL.down, endY], [D, endY]],
              opacity: [[0, 0], [v.s, 0], [v.s + 0.15, 1], [v.s + TRAVEL.down + (v.converts ? TRAVEL.across : 0.4), 1], [v.s + TRAVEL.down + (v.converts ? TRAVEL.across + 0.2 : 0.65), 0], [D, 0]],
            }}
          >
            <rect x="-2" y="-2" width="4" height="4" fill={v.converts ? SEL : MUTED} />
          </G>
        );
      })}
    </G>
  );
}

const SCENES = [SceneEvent, SceneReport, SceneHomepage, SceneAB];

export function RequestScene({ index, active, snapshot, fit, scope = "" }: { index: number; active: boolean; snapshot?: boolean; fit?: boolean; scope?: string }) {
  const reduce = !!useReducedMotion() || !!snapshot;
  const Scene = SCENES[index];
  return (
    <IdScope.Provider value={`${scope}s${index}-`}>
    <Ctx.Provider value={{ on: active && !reduce, reduce }}>
      <svg aria-hidden viewBox="0 0 480 204" fill="none" className={fit ? "absolute inset-0 h-full w-full overflow-visible" : "block h-auto w-full overflow-visible"}>
        <Scene />
      </svg>
    </Ctx.Provider>
    </IdScope.Provider>
  );
}

/* ───────────────────────── Migration · Webflow keeps running, Sanity fills in stages ───────────────────────── */

const M = 20;
const mPath = (x: number, y: number, cols: number, rows: number) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) d += `M${x + k * M + 0.5} ${y + r * M + 0.5}h${M}v${M}h${-M}Z`;
  return d;
};

function MEdge({ x, y, w, h, t, dashed, color = SEL }: { x: number; y: number; w: number; h: number; t: Track; dashed?: boolean; color?: string }) {
  const x0 = x + 0.5, y0 = y + 0.5;
  return (
    <G t={{ opacity: t }}>
      <rect x={x0} y={y0} width={w} height={h} stroke={color} strokeDasharray={dashed ? "4 3" : undefined} fill="none" />
      {[[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].map(([a, b], i) => <Node key={i} x={a} y={b} />)}
    </G>
  );
}

/** One import: Webflow range selected (dashed), a copy travels down into the Sanity lane. */
function Import({ col, cols, s }: { col: number; cols: number; s: number }) {
  const x = col * M, w = cols * M;
  return (
    <>
      <MEdge x={x} y={22} w={w} h={2 * M} dashed t={pulse(s, s + 0.6)} />
      <G t={{ y: ev(0, 90, s + 0.4, s + 1.2), opacity: show(s + 0.3, 0.2) }}>
        <rect x={x + 0.5} y={22.5} width={w} height={2 * M} fill={BG} />
        <path d={mPath(x, 22, cols, 2)} stroke={CHANGED_CELL} fill="none" />
        <MEdge x={x} y={22} w={w} h={2 * M} dashed t={pulse(s + 0.3, s + 1.2)} />
        <G t={{ opacity: show(s + 1.3) }}>
          <rect x={x + 0.5} y={22.5} width={w} height={2 * M} stroke={CHANGED_EDGE} fill="none" />
        </G>
      </G>
    </>
  );
}



/** One content edit on the live site: the cell fills, a copy drops into the Sanity lane, the Sanity cell fills too. */
function Edit({ col, t }: { col: number; t: number }) {
  const x = col * M + 5;
  return (
    <>
      <G t={{ opacity: [[0, 0], [t, 0], [t + 0.25, 1], [t + 1.1, 1], [t + 1.5, 0.35], [6.05, 0.35], [6.35, 0], [D, 0]] }}>
        <rect x={x} y={27} width={M - 9} height={M - 9} fill={SEL} />
      </G>
      <G t={{ y: ev(0, 90, t + 0.45, t + 1.05), opacity: [[0, 0], [t + 0.4, 0], [t + 0.5, 1], [t + 1.0, 1], [t + 1.1, 0], [D, 0]] }}>
        <rect x={x} y={27} width={M - 9} height={M - 9} fill={SEL} />
      </G>
      <G t={{ opacity: [[0, 0], [t + 1.0, 0], [t + 1.1, 1], [t + 1.6, 1], [t + 2.0, 0.35], [6.05, 0.35], [6.35, 0], [D, 0]] }}>
        <rect x={x} y={117} width={M - 9} height={M - 9} fill={SEL} />
      </G>
    </>
  );
}

/** True below the `sm` breakpoint (after mount; SSR renders the desktop layout). */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

export function MigrationLanes({ snapshot }: { snapshot?: boolean } = {}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = !!useReducedMotion() || !!snapshot;
  const on = inView && !reduce;
  const narrow = useNarrow();
  // narrow screens: half the columns, so the labels stay readable
  const N = narrow ? 15 : 30;
  const imports = narrow ? [[0, 5, 0.4], [5, 4, 1.5], [9, 6, 4.0]] : [[0, 10, 0.4], [10, 8, 1.5], [18, 12, 4.0]];
  const labels = ["IMPORT 01", "IMPORT 02", "IMPORT 03"];
  const at = [1.6, 2.7, 5.2];
  // edits on the live site, each in a range that is already imported
  const edits = narrow ? [[2, 2.0], [6, 3.3], [3, 4.7]] : [[4, 2.0], [13, 3.3], [7, 4.7]];
  return (
    <Ctx.Provider value={{ on, reduce }}>
      <svg aria-hidden ref={ref} viewBox={narrow ? "0 0 301 196" : "0 0 620 196"} fill="none" className="block h-auto w-full overflow-visible" style={{ fontFamily: "var(--font-mono)" }}>
        {/* labels: "live" moves from Webflow to Sanity at the cutover */}
        <G t={{ opacity: [[0, 1], [5.4, 1], [5.8, 0.4], [6.3, 0.4], [6.7, 1], [D, 1]] }}>
          <text x="0" y="11" fill={MUTED} fontSize="11">WEBFLOW</text>
        </G>
        <G t={{ opacity: ev(1, 0, 5.4, 5.7) }}>
          <text x="53" y="11" fill={MUTED} fontSize="11">— LIVE</text>
        </G>
        <text x="0" y="101" fill={MUTED} fontSize="11">SANITY</text>
        <G t={{ opacity: ev(0, 1, 5.6, 5.9) }}>
          <text x="46" y="101" fill={SEL} fontSize="11">— LIVE</text>
        </G>

        {/* Webflow lane — dims after the cutover */}
        <G t={{ opacity: [[0, 1], [5.4, 1], [5.8, 0.4], [6.3, 0.4], [6.7, 1], [D, 1]] }}>
          <rect x="0.5" y="22.5" width={N * M} height={2 * M} fill={BG} />
          <path d={mPath(0, 22, N, 2)} stroke={GRID} fill="none" />
        </G>

        {/* Sanity lane: empty slots, filled in stages */}
        <rect x="0.5" y="112.5" width={N * M} height={2 * M} stroke="#3a3a3a" strokeDasharray="2 3" fill="none" />

        <G t={{ opacity: FADE }}>
          {imports.map(([col, cols, s]) => <Import key={col} col={col} cols={cols} s={s} />)}
          {labels.map((l, i) => (
            <G key={l} t={{ opacity: show(at[i]) }}>
              {i > 0 && <line x1={imports[i][0] * M + 0.5} y1="106" x2={imports[i][0] * M + 0.5} y2="158" stroke={GRID} />}
              <text x={i === 0 ? 0 : imports[i][0] * M + 6} y="170" fill={MUTED} fontSize="10">{l}</text>
            </G>
          ))}

          {/* no content freeze: the team keeps editing the live Webflow site; each edit lands in Sanity too */}
          {edits.map(([col, t]) => <Edit key={col} col={col} t={t} />)}
        </G>
      </svg>
    </Ctx.Provider>
  );
}

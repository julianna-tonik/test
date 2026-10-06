"use client";

import { createContext, useContext } from "react";
import { motion, useReducedMotion } from "motion/react";
import { easeOut } from "./shared";

/**
 * Example-request illustrations in the Vibe Fixer video language:
 * the page grid is always there (outlines only) and the request plays as an
 * event on top of it, in a loop. Dashed frame with handles = AI selects/changes,
 * solid bright outline = changed or protected.
 */

const D = 7; // loop length (s)
const RESULT = 6; // moment shown for reduced motion
const C = 12; // grid cell
const BG = "#212121";
const LINE = "#555";
const HI = "#efefef";
const MUTED = "#888";
const io = [0.65, 0, 0.35, 1] as const;

type V = number | string;
type Track = [number, V][];

/** a → b between t0 and t1, held until the reset (hidden by the scene fade). */
const ev = (a: V, b: V, t0: number, t1: number): Track => [[0, a], [t0, a], [t1, b], [6.6, b], [6.62, a], [D, a]];
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
  return <motion.g {...useLoop(t)} {...rest} />;
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

/** Grid block; the background fill keeps overlapping outlines clean when blocks move. */
function Cells({ x, y, cols, rows, stroke = LINE }: { x: number; y: number; cols: number; rows: number; stroke?: string }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={cols * C} height={rows * C} fill={BG} />
      <path d={cellsPath(x, y, cols, rows)} stroke={stroke} strokeWidth="1" fill="none" />
    </>
  );
}

/** Bright copy of a block that fades in = "this part changed". */
function Lit({ x, y, cols, rows, t }: { x: number; y: number; cols: number; rows: number; t: Track }) {
  return (
    <G t={{ opacity: t }}>
      <path d={cellsPath(x, y, cols, rows)} stroke={HI} strokeWidth="1" fill="none" />
    </G>
  );
}

/** Figma-like selection: dashed frame with handles, as in the VF "Standardize Design" video. */
function Sel({ x, y, w, h, t }: { x: number; y: number; w: number; h: number; t: Track }) {
  const p = 3;
  const hs = [
    [x - p, y - p], [x + w / 2, y - p], [x + w + p, y - p],
    [x - p, y + h / 2], [x + w + p, y + h / 2],
    [x - p, y + h + p], [x + w / 2, y + h + p], [x + w + p, y + h + p],
  ];
  return (
    <G t={{ opacity: t }}>
      <rect x={x - p + 0.5} y={y - p + 0.5} width={w + 2 * p} height={h + 2 * p} stroke={HI} strokeWidth="0.75" strokeDasharray="3 3" fill="none" />
      {hs.map(([hx, hy], i) => (
        <rect key={i} x={hx - 1.5} y={hy - 1.5} width="4" height="4" fill={BG} stroke={HI} strokeWidth="0.75" />
      ))}
    </G>
  );
}

function Tag({ x, y, children, t, color = HI }: { x: number; y: number; children: string; t?: Track; color?: string }) {
  const text = (
    <text x={x} y={y} fill={color} fontSize="9" letterSpacing="-0.2" style={{ fontFamily: "var(--font-mono)" }}>
      {children}
    </text>
  );
  return t ? <G t={{ opacity: t }}>{text}</G> : text;
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={HI} strokeWidth="0.75" fill="none">
      <rect x={x + 0.5} y={y + 3.5} width="7" height="5.5" />
      <path d={`M${x + 2} ${y + 3.5}v-1.2a2 2 0 0 1 4 0v1.2`} />
    </g>
  );
}

/** Whole-scene fade that hides the reset between loops. */
const FADE: Track = [[0, 1], [6.25, 1], [6.5, 0], [6.75, 0], [D, 1]];

/* ───────────────────────── 01 · assembled from what you already have ───────────────────────── */

function SceneEvent() {
  const L = 16, P = 272, dx = P - L;
  const picks = [
    { y: 20, cols: 16, rows: 3, to: 40 },
    { y: 64, cols: 8, rows: 3, to: 84 },
    { y: 108, cols: 10, rows: 3, to: 128 },
  ];
  return (
    <G t={{ opacity: FADE }}>
      <Tag x={L} y={10} color={MUTED}>APPROVED SECTIONS</Tag>
      <Tag x={P} y={10} color={MUTED}>NEW PAGE</Tag>

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
      <rect x={P + 0.5} y={20.5} width={16 * C} height={176} stroke="#383838" fill="none" />
      <Cells x={P} y={20} cols={16} rows={1} />

      {picks.map((p, i) => {
        const s = 0.8 + i * 1.5;
        return (
          <g key={i}>
            <Sel x={L} y={p.y} w={p.cols * C} h={p.rows * C} t={pulse(s, s + 1.1)} />
            <G t={{ x: ev(0, dx, s + 0.5, s + 1.3), y: ev(0, p.to - p.y, s + 0.5, s + 1.3), opacity: show(s + 0.2, 0.3) }}>
              <rect x={L + 0.5} y={p.y + 0.5} width={p.cols * C} height={p.rows * C} fill={BG} />
              <path d={cellsPath(L, p.y, p.cols, p.rows)} stroke={HI} strokeWidth="1" fill="none" />
            </G>
          </g>
        );
      })}

      <G t={{ opacity: show(5.1) }}>
        <rect x={P + 0.5} y={172.5} width="44" height="16" stroke={HI} strokeWidth="0.75" fill={BG} />
        <Tag x={P + 8} y={183.5}>DRAFT</Tag>
      </G>
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
        <Lit x={X} y={100} cols={W} rows={3} t={show(1.2)} />
        <Sel x={X} y={100} w={W * C} h={36} t={pulse(0.6, 2.1)} />
      </G>

      {/* gated report: dims behind the form, opens after the email */}
      <G t={{ opacity: [[0, 1], [2.4, 1], [2.8, 0.25], [4.1, 0.25], [4.4, 1], [D, 1]] }}>
        <Cells x={X} y={164} cols={W} rows={3} />
      </G>
      <Lit x={X} y={164} cols={W} rows={3} t={show(4.1)} />

      {/* form */}
      <G t={{ opacity: show(2.4) }}>
        <rect x={X + 0.5} y={144.5} width={W * C} height={C} fill={BG} stroke={HI} strokeWidth="0.75" />
        <line x1={X + 15 * C + 0.5} y1="144.5" x2={X + 15 * C + 0.5} y2="156.5" stroke={HI} strokeWidth="0.75" />
        <G t={{ opacity: ev(1, 0, 3.0, 3.2) }}>
          <Tag x={X + 6} y={153.5} color={MUTED}>WORK EMAIL</Tag>
        </G>
        <R t={{ scaleX: ev(0, 1, 3.1, 3.9) }} x={X + 6} y={150} width={15 * C - 14} height="1" fill={HI} style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
        <R t={{ opacity: ev(0, 1, 3.9, 4.1) }} x={X + 15 * C + 1} y={145} width={5 * C - 1} height={C - 1} fill="#3a3a3a" />
      </G>

      {/* staging preview */}
      <G t={{ opacity: show(4.6, 0.5), x: ev(-24, 0, 4.6, 5.3) }}>
        <line x1="274" y1="100.5" x2="306" y2="100.5" stroke={MUTED} strokeWidth="0.75" strokeDasharray="2 3" />
        <g stroke={HI} strokeWidth="0.75" fill="none">
          <rect x="318.5" y="24.5" width="138" height="150" />
          <rect x="326.5" y="32.5" width="122" height="6" />
          <rect x="326.5" y="44.5" width="122" height="14" />
          <rect x="326.5" y="64.5" width="122" height="22" />
          <rect x="326.5" y="92.5" width="122" height="22" />
          <rect x="326.5" y="120.5" width="122" height="7" />
          <rect x="326.5" y="133.5" width="122" height="33" />
        </g>
        <Tag x={318} y={190}>STAGING PREVIEW</Tag>
      </G>
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

const NOISE = (() => {
  const r = rng(7);
  const out: { k: number; row: number; fill: string; t: Track }[] = [];
  for (let row = 0; row < 3; row++)
    for (let k = 0; k < 30; k++) {
      const g = Math.round(51 + r() * 140);
      const peak = 0.4 + r() * 0.6;
      const a = 1.5 + r() * 0.25, b = 2.5 + (k / 30) * 0.4 + r() * 0.15;
      out.push({ k, row, fill: `rgb(${g},${g},${g})`, t: [[0, 0], [a, 0], [a + 0.15, peak], [a + 0.5, peak * 0.4], [a + 0.75, peak], [b, peak * 0.6], [b + 0.2, 0], [D, 0]] });
    }
  return out;
})();

function SceneHomepage() {
  const X = 60, W = 30;
  return (
    <G t={{ opacity: FADE }}>
      {/* protected: navigation + legal */}
      <Cells x={X} y={6} cols={W} rows={1} />
      <Cells x={X} y={178} cols={W} rows={1} />
      <G t={{ opacity: show(0.5) }}>
        <rect x={X - 2.5} y={3.5} width={W * C + 6} height={C + 6} stroke={HI} strokeWidth="0.75" fill="none" />
        <rect x={X - 2.5} y={175.5} width={W * C + 6} height={C + 6} stroke={HI} strokeWidth="0.75" fill="none" />
        <Lock x={X + W * C + 10} y={7} />
        <Lock x={X + W * C + 10} y={179} />
      </G>

      {/* hero headline: replaced */}
      <Cells x={X} y={26} cols={W} rows={3} />
      {NOISE.map((n, i) => (
        <R key={i} t={{ opacity: n.t }} x={X + n.k * C + 1} y={26 + n.row * C + 1} width={C - 1} height={C - 1} fill={n.fill} />
      ))}
      <Lit x={X} y={26} cols={W} rows={3} t={show(2.7)} />
      <Sel x={X} y={26} w={W * C} h={36} t={pulse(1.2, 2.9)} />

      {/* product tour slides down, customer logos move above it */}
      <G t={{ y: ev(0, 20, 3.4, 4.2) }}>
        <Cells x={X} y={70} cols={W} rows={3} />
      </G>
      <G t={{ y: ev(0, -44, 3.4, 4.2) }}>
        <Cells x={X} y={114} cols={W} rows={1} />
        <Lit x={X} y={114} cols={W} rows={1} t={show(3.4)} />
        <Sel x={X} y={114} w={W * C} h={C} t={pulse(3.0, 4.3)} />
      </G>

      {/* quote: swapped */}
      <Cells x={X} y={134} cols={W} rows={3} />
      <R t={{ scaleX: ev(0, 1, 4.9, 5.5) }} x={X + 0.5} y={134.5} width={W * C} height={36} fill="#2c2c2c" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
      <Lit x={X} y={134} cols={W} rows={3} t={show(5.3)} />
      <Sel x={X} y={134} w={W * C} h={36} t={pulse(4.6, 5.7)} />
    </G>
  );
}

/* ───────────────────────── 04 · split into A/B and measure ───────────────────────── */

function Page({ variant }: { variant: "A" | "B" }) {
  const b = variant === "B";
  return (
    <>
      <Cells x={0} y={6} cols={14} rows={1} />
      <Cells x={0} y={26} cols={14} rows={3} />
      <Cells x={0} y={70} cols={14} rows={4} />
      <Cells x={0} y={126} cols={5} rows={1} />
      <Cells x={0} y={146} cols={14} rows={1} />
      {b && (
        <>
          <R t={{ scaleX: ev(0, 1, 2.3, 2.9) }} x={0.5} y={26.5} width={14 * C} height={36} fill="#2c2c2c" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
          <Lit x={0} y={26} cols={14} rows={3} t={show(2.6)} />
          <Lit x={0} y={126} cols={5} rows={1} t={show(2.6)} />
          <Sel x={0} y={26} w={14 * C} h={36} t={pulse(1.9, 3.0)} />
          <Sel x={0} y={126} w={5 * C} h={C} t={pulse(2.1, 3.0)} />
        </>
      )}
      <G t={{ opacity: show(1.6) }}>
        <Tag x={0} y={184} color={b ? HI : MUTED}>{variant}</Tag>
        {Array.from({ length: 6 }).map((_, k) => (
          <rect key={k} x={14.5 + k * 10} y={176.5} width="7" height="7" stroke={LINE} strokeWidth="0.75" fill="none" />
        ))}
      </G>
    </>
  );
}

const DOTS = Array.from({ length: 7 }).map((_, j) => ({ s: 3.2 + j * 0.42, toB: j % 2 === 0 }));

function SceneAB() {
  const ax = 40, bx = 272, cx = 156;
  const meter = (toB: boolean) => DOTS.filter((d) => d.toB === toB).map((d, n) => ({ n, t: d.s + 0.95 }));
  return (
    <G t={{ opacity: FADE }}>
      <G t={{ opacity: show(1.4) }}>
        <line x1="240.5" y1="12" x2="240.5" y2="160" stroke={MUTED} strokeWidth="0.75" strokeDasharray="2 3" />
        <Tag x={227} y={184} color={MUTED}>50/50</Tag>
      </G>

      <G t={{ x: ev(cx, ax, 0.8, 1.7) }}>
        <Page variant="A" />
        {meter(false).map((m) => (
          <R key={m.n} t={{ opacity: show(m.t, 0.15) }} x={15 + m.n * 10} y={177} width="6" height="6" fill={MUTED} />
        ))}
      </G>
      <G t={{ x: ev(cx, bx, 0.8, 1.7) }}>
        <Page variant="B" />
        {meter(true).map((m) => (
          <R key={m.n} t={{ opacity: show(m.t, 0.15) }} x={15 + m.n * 10} y={177} width="6" height="6" fill={HI} />
        ))}
      </G>

      {/* visitors split 50/50 and convert on the registration CTA */}
      {DOTS.map((d, j) => {
        const tx = (d.toB ? bx : ax) + 30;
        return (
          <G
            key={j}
            t={{
              x: [[0, 240.5], [d.s + 0.5, 240.5], [d.s + 0.95, tx], [D, tx]],
              y: [[0, 8], [d.s, 8], [d.s + 0.5, 132.5], [D, 132.5]],
              opacity: [[0, 0], [d.s, 0], [d.s + 0.1, 1], [d.s + 0.9, 1], [d.s + 1.05, 0], [D, 0]],
            }}
          >
            <circle cx="0" cy="0" r="2" fill={HI} />
          </G>
        );
      })}
    </G>
  );
}

const SCENES = [SceneEvent, SceneReport, SceneHomepage, SceneAB];

export function RequestScene({ index, active }: { index: number; active: boolean }) {
  const reduce = !!useReducedMotion();
  const Scene = SCENES[index];
  return (
    <Ctx.Provider value={{ on: active && !reduce, reduce }}>
      <svg viewBox="0 0 480 204" fill="none" className="block h-auto w-full overflow-visible">
        <Scene />
      </svg>
    </Ctx.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Actor, ActorTag } from "./actor";

/**
 * Hero visual: three small product fragments (Ask → Build → Review), drawn as
 * graphics, not UI copy. Same language as the example scenes:
 * grid blocks, dashed edge + nodes = AI at work, solid edge + cursor = a person.
 */

type Phase = 0 | 1 | 2;
const PHASE_S: Record<Phase, number> = { 0: 3.8, 1: 3.6, 2: 6.8 };

const STEPS: { label: string; title: string; actor: Actor; who: string }[] = [
  { label: "01 Ask", title: "Ask for the page", actor: "human", who: "You" },
  { label: "02 Build", title: "Watch it assemble", actor: "ai", who: "AI" },
  { label: "03 Review", title: "Review the live draft", actor: "human", who: "Your team" },
];

export const BG = "#1c1c1c";
export const GRID = "#424242";
export const LINE = "#383838";
export const SOFT = "#555";
export const MID = "#888";
export const EDGE = "#9a9a9a";
export const HI = "#efefef";
const io = [0.65, 0, 0.35, 1] as const;

/* ── timeline engine: each panel plays its keyframes once while its phase is active ── */

export type Mode = "before" | "play" | "after";
type V = number | string;
export type Track = [number, V][];
export const PanelCtx = createContext<{ mode: Mode; dur: number }>({ mode: "before", dur: 1 });

export const ab = (a: V, b: V, t0: number, t1: number, dur: number): Track => [[0, a], [t0, a], [t1, b], [dur, b]];

function useSeq(tracks: Record<string, Track>, linear?: string[]) {
  const { mode, dur } = useContext(PanelCtx);
  const initial: Record<string, V> = {};
  const animate: Record<string, V | V[]> = {};
  const transition: Record<string, object> = {};
  for (const [k, pts] of Object.entries(tracks)) {
    initial[k] = mode === "after" ? pts[pts.length - 1][1] : pts[0][1];
    if (mode === "play") {
      animate[k] = pts.map((p) => p[1]);
      transition[k] = { duration: dur, times: pts.map((p) => p[0] / dur), ease: linear?.includes(k) ? "linear" : io };
    } else {
      animate[k] = mode === "after" ? pts[pts.length - 1][1] : pts[0][1];
      transition[k] = { duration: 0.5, ease: io };
    }
  }
  return { initial, animate, transition };
}

type GP = React.ComponentProps<typeof motion.g> & { t: Record<string, Track>; linear?: string[] };
export const G = ({ t, linear, ...rest }: GP) => <motion.g {...useSeq(t, linear)} {...rest} />;
type RP = React.ComponentProps<typeof motion.rect> & { t: Record<string, Track>; linear?: string[] };
export const R = ({ t, linear, ...rest }: RP) => <motion.rect {...useSeq(t, linear)} {...rest} />;

export const useDur = () => useContext(PanelCtx).dur;

/* ── primitives ── */

export const C = 10;
export const cellsPath = (x: number, y: number, cols: number, rows: number) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) d += `M${x + k * C + 0.5} ${y + r * C + 0.5}h${C}v${C}h${-C}Z`;
  return d;
};

function Node({ x, y, color = HI }: { x: number; y: number; color?: string }) {
  return <rect x={x - 2} y={y - 2} width="4.5" height="4.5" fill={BG} stroke={color} strokeWidth="0.75" />;
}

export function EdgeBox({ x, y, w, h, dashed, color = HI, nodes = true }: { x: number; y: number; w: number; h: number; dashed?: boolean; color?: string; nodes?: boolean }) {
  const x0 = x + 0.5, y0 = y + 0.5;
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} stroke={color} strokeWidth="1" strokeDasharray={dashed ? "4 3" : undefined} fill="none" />
      {nodes && [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].map(([a, b], i) => <Node key={i} x={a} y={b} color={color} />)}
    </>
  );
}

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <line x1="0" y1="32.5" x2="320" y2="32.5" stroke={LINE} />
      {children}
    </>
  );
}

export function Cursor() {
  return <path d="M0 0L11.6 7L6.3 8.1L3.7 13.2Z" fill={HI} stroke={BG} strokeWidth="1" strokeLinejoin="round" />;
}

/* ── shared page layout: the same page is built in 02 and reviewed in 03 ── */

export const PAGE = { x: 40, w: 240 };
export const SLOT = {
  hero: { y: 48, h: 50 },
  logos: { y: 110, h: 10 },
  cards: { y: 132, h: 40 },
  cta: { y: 184, h: 30 },
};
/** Three cards (7 cells wide) become four (5 cells wide) when AI adds one. */
export const CARDS4 = [40, 40 + 190 / 3, 40 + 380 / 3, 230];
export const CARD_W4 = 50;

/* ── 03 REVIEW pieces (shared with /sanity/review-variants); the hero uses variant C · approve ── */

const CARD_Y = 132;



/** Draft → live switch in the header; flips at t. */
export function SwitchHeader({ t }: { t: number }) {
  const d = useDur();
  return (
    <Header>
      <rect x="10" y="15" width="64" height="3" fill="#444" />
      <G t={{ opacity: ab(1, 0, t + 0.05, t + 0.25, d) }}>
        <text x="271" y="19.5" textAnchor="end" fill={MID} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>DRAFT</text>
      </G>
      <G t={{ opacity: ab(0, 1, t + 0.15, t + 0.45, d) }}>
        <text x="271" y="19.5" textAnchor="end" fill={HI} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>LIVE</text>
      </G>
      <rect x="278.5" y="10.5" width="31" height="12" rx="6" stroke={SOFT} fill="none" />
      <R t={{ opacity: ab(0, 1, t, t + 0.4, d) }} x={279} y={11} width={30} height={11} rx={5.5} fill="#3a3a3a" />
      <G t={{ x: ab(0, 18, t, t + 0.4, d) }}>
        <circle cx="285" cy="16.5" r="4" fill={MID} />
      </G>
      <G t={{ x: ab(0, 18, t, t + 0.4, d), opacity: ab(0, 1, t + 0.15, t + 0.4, d) }}>
        <circle cx="285" cy="16.5" r="4" fill={HI} />
      </G>
    </Header>
  );
}

/** Page frame that lights up once live, plus a slow sweep across the given boxes. */
export function GoLive({ id, t, boxes }: { id: string; t: number; boxes: [number, number, number, number][] }) {
  const d = useDur();
  return (
    <>
      <R t={{ stroke: ab("#2e2e2e", EDGE, t, t + 0.5, d) }} x={36.5} y={44.5} width={248} height={174} fill="none" />
      <defs>
        <linearGradient id={`vg${id}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`vm${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="240">
          <R t={{ x: ab(-160, 340, t, t + 1.2, d) }} y={40} width={160} height={200} fill={`url(#vg${id})`} />
        </mask>
      </defs>
      <g mask={`url(#vm${id})`} stroke="#bdbdbd" fill="none">
        {boxes.map(([x, y, w, h], i) => <rect key={i} x={x + 0.5} y={y + 0.5} width={w} height={h} />)}
      </g>
    </>
  );
}

export function Person({ t }: { t: Record<string, Track> }) {
  return (
    <G t={t}>
      <Cursor />
    </G>
  );
}

/* ── B · GRID: the page stays in squares, like panel 02 and Vibe Fixer ── */

export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Hero data noise; `end` must equal the panel's loop length so keyframe times stay within 0–1. */
export const heroNoise = (end: number) => {
  const r = rng(5);
  const out: { k: number; row: number; fill: string; t: Track }[] = [];
  for (let row = 0; row < 5; row++)
    for (let k = 0; k < 24; k++) {
      const g = Math.round(48 + r() * 110);
      const peak = 0.3 + r() * 0.6;
      const a = 1.35 + r() * 0.2, b = 2.1 + (k / 24) * 0.35 + r() * 0.1;
      out.push({ k, row, fill: `rgb(${g},${g},${g})`, t: [[0, 0], [a, 0], [a + 0.15, peak], [a + 0.45, peak * 0.4], [b, peak * 0.7], [b + 0.2, 0], [end, 0]] });
    }
  return out;
};
const HERO_NOISE_B = heroNoise(7.2);

export function ReviewGrid() {
  const d = useDur();
  return (
    <>
      <SwitchHeader t={4.9} />

      {/* hero: rewritten — data noise, then the new cells settle */}
      <path d={cellsPath(40, 48, 24, 5)} stroke={GRID} fill="none" />
      {HERO_NOISE_B.map((n, i) => (
        <R key={i} t={{ opacity: n.t }} x={40 + n.k * C + 1} y={48 + n.row * C + 1} width={C - 1} height={C - 1} fill={n.fill} />
      ))}
      <G t={{ opacity: ab(0, 1, 2.3, 2.6, d) }}>
        <path d={cellsPath(40, 48, 24, 5)} stroke="#5f5f5f" fill="none" />
      </G>
      <G t={{ opacity: [[0, 0], [1.15, 0], [1.25, 1], [2.5, 1], [2.7, 0], [d, 0]] }}>
        <EdgeBox x={40} y={48} w={240} h={50} />
      </G>

      {/* cards move up as the logo row is dragged below them */}
      <G t={{ y: ab(0, -22, 3.0, 3.8, d) }}>
        {CARDS4.map((x) => (
          <path key={x} d={cellsPath(0, CARD_Y, 5, 4)} transform={`translate(${x} 0)`} stroke={GRID} fill="none" />
        ))}
      </G>
      <G t={{ y: ab(0, 52, 3.0, 3.8, d) }}>
        <rect x="40.5" y="110.5" width="240" height="10" fill={BG} />
        <path d={cellsPath(40, 110, 24, 1)} stroke={GRID} fill="none" />
        <G t={{ opacity: [[0, 0], [2.85, 0], [2.95, 1], [3.9, 1], [4.1, 0], [d, 0]] }}>
          <EdgeBox x={40} y={110} w={240} h={10} />
        </G>
      </G>
      <path d={cellsPath(40, 184, 24, 3)} stroke={GRID} fill="none" />

      {/* live: every cell lifts a step */}
      <G t={{ opacity: ab(0, 1, 5.3, 5.8, d) }}>
        <path
          d={cellsPath(40, 48, 24, 5) + CARDS4.map((x) => cellsPath(x, 110, 5, 4)).join("") + cellsPath(40, 162, 24, 1) + cellsPath(40, 184, 24, 3)}
          stroke="#555"
          fill="none"
        />
      </G>
      <GoLive id="b" t={5.3} boxes={[[40, 48, 240, 50], ...CARDS4.map((x): [number, number, number, number] => [x, 110, CARD_W4, 40]), [40, 162, 240, 10], [40, 184, 240, 30]]} />

      <Person
        t={{
          x: [[0, 300], [0.4, 300], [1.1, 150], [2.4, 150], [2.85, 170], [3.8, 170], [4.8, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.1, 72], [2.4, 72], [2.85, 116], [3.0, 116], [3.8, 168], [4.8, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [5.5, 1], [5.9, 0], [d, 0]],
          scale: [[0, 1], [1.1, 1], [1.17, 0.82], [1.27, 1], [2.85, 1], [2.92, 0.85], [3.8, 0.85], [3.9, 1], [4.8, 1], [4.87, 0.82], [4.97, 1], [d, 1]],
        }}
      />
    </>
  );
}

export const BAR = "#5a5a5a";
export const leftGrow = { transformBox: "fill-box" as const, originX: 0, originY: 0.5 };
const SLOT_STEP = CARDS4[1] - CARDS4[0];

/** Card row where card 4 is dragged to the front and the others make room. */
export function useCardMoves(t0: number, t1: number) {
  const d = useDur();
  return CARDS4.map((x, i) => (i === 3 ? ab(0, CARDS4[0] - x, t0, t1, d) : ab(0, SLOT_STEP, t0, t1, d)));
}

/* ── C · APPROVE: AI's draft is dashed; each block the person checks turns solid ── */

/** A block that starts as AI draft (dashed) and becomes approved (solid) at t. */
function DraftBlock({ x, y, w, h, t }: { x: number; y: number; w: number; h: number; t: number }) {
  const d = useDur();
  return (
    <>
      <G t={{ opacity: ab(1, 0, t, t + 0.25, d) }}>
        <rect x={x + 0.5} y={y + 0.5} width={w} height={h} stroke={MID} strokeDasharray="3 3" fill="none" />
      </G>
      <G t={{ opacity: ab(0, 1, t, t + 0.25, d) }}>
        <rect x={x + 0.5} y={y + 0.5} width={w} height={h} stroke={EDGE} fill="none" />
      </G>
      <G t={{ opacity: [[0, 0], [t - 0.05, 0], [t + 0.05, 1], [t + 0.6, 1], [t + 0.8, 0], [d, 0]] }}>
        <EdgeBox x={x} y={y} w={w} h={h} />
      </G>
    </>
  );
}

export function ReviewApprove() {
  const d = useDur();
  const moves = useCardMoves(2.9, 3.6);
  return (
    <>
      <SwitchHeader t={5.6} />

      {/* hero: approved, and its headline shortened */}
      <DraftBlock x={40} y={48} w={240} h={50} t={1.15} />
      <R t={{ scaleX: [[0, 1], [1.35, 1], [1.5, 0], [1.9, 0.75], [d, 0.75]] }} linear={["scaleX"]} x={50} y={58} width={160} height={6} fill={BAR} style={leftGrow} />
      <rect x="50" y="70" width="96" height="6" fill={BAR} />
      <rect x="50" y="84" width="150" height="2" fill={BAR} />

      {/* logo row */}
      <DraftBlock x={40} y={110} w={240} h={10} t={2.2} />

      {/* cards: the fourth is moved to the front, then the row is approved */}
      {CARDS4.map((x, i) => (
        <G key={i} t={{ x: moves[i] }}>
          <DraftBlock x={x} y={CARD_Y} w={CARD_W4} h={40} t={4.0} />
          <rect x={x + 6} y={CARD_Y + 8} width="28" height="4" fill={BAR} />
        </G>
      ))}

      {/* cta */}
      <DraftBlock x={40} y={184} w={240} h={30} t={4.75} />
      <rect x="50" y="193" width="110" height="5" fill={BAR} />

      <GoLive id="c" t={6.0} boxes={[[40, 48, 240, 50], [40, 110, 240, 10], ...CARDS4.map((x): [number, number, number, number] => [x, CARD_Y, CARD_W4, 40]), [40, 184, 240, 30]]} />

      <Person
        t={{
          x: [[0, 300], [0.4, 300], [1.05, 150], [1.9, 150], [2.15, 200], [2.55, 200], [2.8, 255], [2.9, 255], [3.6, 65], [3.75, 65], [3.95, 160], [4.4, 160], [4.7, 200], [5.0, 200], [5.5, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.05, 62], [1.9, 62], [2.15, 116], [2.55, 116], [2.8, 152], [3.75, 152], [3.95, 152], [4.4, 152], [4.7, 198], [5.0, 198], [5.5, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [6.2, 1], [6.6, 0], [d, 0]],
          scale: [[0, 1], [1.05, 1], [1.12, 0.82], [1.22, 1], [2.15, 1], [2.22, 0.82], [2.32, 1], [2.85, 1], [2.9, 0.85], [3.6, 0.85], [3.7, 1], [3.95, 1], [4.02, 0.82], [4.12, 1], [4.7, 1], [4.77, 0.82], [4.87, 1], [5.5, 1], [5.57, 0.82], [5.67, 1], [d, 1]],
        }}
      />
    </>
  );
}

/* ── LITERAL hero panels (founder-readable): real copy, named sections, statuses ── */

function MonoT({ x, y, children, color = MID, size = 6.5, anchor }: { x: number; y: number; children: string; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} letterSpacing="0.2" textAnchor={anchor} style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
      {children}
    </text>
  );
}
function SansT({ x, y, children, color = "#cfcfcf", size = 9 }: { x: number; y: number; children: string; color?: string; size?: number }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} letterSpacing="-0.2" style={{ fontFamily: "var(--font-sans)" }}>
      {children}
    </text>
  );
}
/** Text typed in left → right inside a growing clip. */
function TypedT({ id, x, y, w, t0, t1, children, size = 9, color }: { id: string; x: number; y: number; w: number; t0: number; t1: number; children: string; size?: number; color?: string }) {
  const d = useDur();
  return (
    <>
      <defs>
        <clipPath id={id}>
          <R t={{ width: ab(0, w, t0, t1, d) }} linear={["width"]} x={x - 1} y={y - size} height={size * 1.6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <SansT x={x} y={y} size={size} color={color}>{children}</SansT>
      </g>
    </>
  );
}

const REQUEST_LINES = ["Create an NYC version of our event page for", "enterprise security teams. Reuse the existing", "template and customer stories."];

function AskLiteral() {
  const d = useDur();
  return (
    <>
      <Header>
        <path d="M10.5 10.5h14v10h-8l-3 3v-3h-3z" stroke={MID} strokeWidth="0.75" fill="none" />
        <MonoT x={32} y={19.5}>New request</MonoT>
        <MonoT x={310} y={19.5} anchor="end" color="#666">Talk to your LLM</MonoT>
      </Header>

      {/* composer: the request is typed */}
      <rect x="10.5" y="166.5" width="299" height="60" stroke={LINE} fill="none" />
      <G t={{ opacity: ab(1, 0, 2.5, 2.7, d) }}>
        {REQUEST_LINES.map((l, i) => (
          <TypedT key={i} id={`ask${i}`} x={20} y={182 + i * 12} w={[205, 210, 140][i]} t0={0.3 + i * 0.65} t1={0.9 + i * 0.65} size={8.5}>{l}</TypedT>
        ))}
      </G>
      <G t={{ opacity: [[0, 0.45], [2.2, 0.45], [2.35, 1], [2.9, 1], [3.2, 0.45], [d, 0.45]] }}>
        <rect x="281.5" y="198.5" width="20" height="20" stroke={HI} fill="none" />
        <path d="M286.5 208.5h10M292.5 204.5l4 4-4 4" stroke={HI} strokeWidth="1" fill="none" />
      </G>

      {/* sent — a person (solid avatar) */}
      <G t={{ opacity: ab(0, 1, 2.5, 2.9, d), y: ab(14, 0, 2.5, 3.0, d) }}>
        <rect x="52.5" y="44.5" width="236" height="52" stroke={SOFT} fill="#222" />
        {REQUEST_LINES.map((l, i) => <SansT key={i} x={62} y={60 + i * 12} size={8.5}>{l}</SansT>)}
        <circle cx="302" cy="90.5" r="6" fill={HI} />
      </G>

      {/* AI picks it up */}
      <G t={{ opacity: ab(0, 1, 3.0, 3.3, d) }}>
        <circle cx="16.5" cy="120.5" r="6" stroke={MID} strokeDasharray="1.8 1.8" fill="none" />
        <MonoT x={30} y={123}>Building a draft in Sanity</MonoT>
        {[0, 1, 2].map((i) => (
          <R key={i} t={{ opacity: [[0, 0.3], [3.1 + i * 0.1, 0.3], [3.3 + i * 0.1, 1], [3.55 + i * 0.1, 0.3], [d, 0.6]] }} x={140 + i * 6} y={119} width="3" height="3" fill={MID} />
        ))}
      </G>
    </>
  );
}

const LIB = ["Hero", "Logos", "Speakers", "Stories", "Form"];
const LIB_REST = ["Stats", "Schedule"];
const BUILT: { name: string; y: number; h: number }[] = [
  { name: "Hero", y: 44, h: 42 },
  { name: "Logos", y: 92, h: 14 },
  { name: "Speakers", y: 112, h: 40 },
  { name: "Stories", y: 158, h: 28 },
  { name: "Form", y: 192, h: 24 },
];

function BuildLiteral() {
  const d = useDur();
  const PX = 88, PW = 222;
  return (
    <>
      <Header>
        <path d="M10.5 10.5h5v5h-5zM17.5 10.5h5v5h-5zM10.5 17.5h5v5h-5zM17.5 17.5h5v5h-5z" stroke={MID} strokeWidth="0.75" fill="none" />
        <MonoT x={32} y={19.5}>Sanity Studio · Events</MonoT>
        <G t={{ opacity: ab(1, 0, 3.15, 3.3, d) }}>
          <MonoT x={310} y={19.5} anchor="end" color="#666">Building…</MonoT>
        </G>
        <G t={{ opacity: ab(0, 1, 3.25, 3.45, d) }}>
          <MonoT x={310} y={19.5} anchor="end" color={HI}>Draft ready</MonoT>
        </G>
      </Header>

      {/* approved section library */}
      <MonoT x={10} y={46} size={5.5} color="#666">Approved sections</MonoT>
      {[...LIB, ...LIB_REST].map((n, i) => (
        <g key={n}>
          <rect x="10.5" y={52.5 + i * 20} width="66" height="15" stroke="#383838" fill="#202020" />
          <MonoT x={16} y={62.5 + i * 20} size={5.5} color={i < LIB.length ? MID : "#555"}>{n}</MonoT>
        </g>
      ))}

      {/* empty slots of the event template, waiting for sections */}
      {BUILT.map((b) => (
        <rect key={b.name} x={PX + 0.5} y={b.y + 0.5} width={PW} height={b.h} stroke="#333" strokeDasharray="2 3" fill="none" />
      ))}
      {BUILT.map((b, i) => {
        const s = 0.2 + i * 0.6;
        return (
          <g key={b.name}>
            {/* chip picked */}
            <G t={{ opacity: [[0, 0], [s, 0], [s + 0.1, 1], [s + 0.5, 1], [s + 0.6, 0], [d, 0]] }}>
              <EdgeBox x={10} y={52 + i * 20} w={66} h={15} dashed />
            </G>
            <G t={{ opacity: ab(0, 1, s + 0.1, s + 0.3, d) }}>
              <rect x="10.5" y={52.5 + i * 20} width="66" height="15" stroke={EDGE} fill="none" />
              <MonoT x={16} y={62.5 + i * 20} size={5.5} color={HI}>{b.name}</MonoT>
            </G>
            {/* section placed on the page */}
            <G t={{ opacity: ab(0, 1, s + 0.2, s + 0.45, d) }}>
              <rect x={PX + 0.5} y={b.y + 0.5} width={PW} height={b.h} fill="#202020" stroke="#383838" />
              <MonoT x={PX + 6} y={b.y + 9} size={5} color="#777">{b.name}</MonoT>
              {b.name === "Hero" && <SansT x={PX + 6} y={b.y + 28} size={11}>NYC Security Summit</SansT>}
              {b.name === "Logos" && [0, 1, 2, 3, 4].map((k) => <rect key={k} x={PX + 60 + k * 32} y={b.y + 5} width="20" height="4" fill="#555" />)}
              {b.name === "Speakers" && [0, 1, 2, 3].map((k) => <rect key={k} x={PX + 6.5 + k * 54} y={b.y + 15.5} width="18" height="18" stroke="#555" fill="none" />)}
              {b.name === "Stories" && <SansT x={PX + 6} y={b.y + 21} size={8}>“Our strongest rollout yet.” — Acme</SansT>}
              {b.name === "Form" && (
                <>
                  <rect x={PX + 6.5} y={b.y + 11.5} width="120" height="9" stroke="#555" fill="none" />
                  <rect x={PX + 132.5} y={b.y + 11.5} width="50" height="9" stroke="#777" fill="none" />
                </>
              )}
            </G>
            <G t={{ opacity: [[0, 0], [s + 0.15, 0], [s + 0.25, 1], [s + 0.55, 1], [s + 0.65, 0], [d, 0]] }}>
              <EdgeBox x={PX} y={b.y} w={PW} h={b.h} dashed />
            </G>
          </g>
        );
      })}
    </>
  );
}

function ReviewLiteral() {
  const d = useDur();
  const X = 20, W = 280;
  const boxes: [number, number, number, number][] = [[X, 44, W, 12], [X, 62, W, 58], [X, 126, W, 34], [X, 166, W, 34], [X, 206, W, 12]];
  return (
    <>
      <Header>
        <MonoT x={10} y={19.5} color="#666">acme.com/nyc-summit</MonoT>
        <G t={{ opacity: ab(1, 0, 4.85, 5.05, d) }}>
          <MonoT x={271} y={19.5} anchor="end">Draft</MonoT>
        </G>
        <G t={{ opacity: ab(0, 1, 4.95, 5.25, d) }}>
          <MonoT x={271} y={19.5} anchor="end" color={HI}>Live</MonoT>
        </G>
        <rect x="278.5" y="10.5" width="31" height="12" rx="6" stroke={SOFT} fill="none" />
        <R t={{ opacity: ab(0, 1, 4.8, 5.2, d) }} x={279} y={11} width={30} height={11} rx={5.5} fill="#3a3a3a" />
        <G t={{ x: ab(0, 18, 4.8, 5.2, d) }}>
          <circle cx="285" cy="16.5" r="4" fill={MID} />
        </G>
        <G t={{ x: ab(0, 18, 4.8, 5.2, d), opacity: ab(0, 1, 4.95, 5.2, d) }}>
          <circle cx="285" cy="16.5" r="4" fill={HI} />
        </G>
      </Header>

      {/* nav */}
      <rect x={X + 0.5} y="44.5" width={W} height="12" fill="#202020" stroke="#333" />
      <MonoT x={X + 6} y={52.5} size={5}>Summit / NYC</MonoT>
      <MonoT x={X + W - 6} y={52.5} size={5} anchor="end">Speakers   Schedule   Register</MonoT>

      {/* hero — the person rewrites the headline */}
      <rect x={X + 0.5} y="62.5" width={W} height="58" fill="#202020" stroke="#333" />
      <MonoT x={X + 8} y={74} size={5}>Enterprise security summit</MonoT>
      <G t={{ opacity: ab(1, 0, 1.35, 1.55, d) }}>
        <SansT x={X + 8} y={91} size={13}>Build trust into</SansT>
        <SansT x={X + 8} y={106} size={13}>every layer.</SansT>
      </G>
      <TypedT id="rv1" x={X + 8} y={91} w={130} t0={1.6} t1={2.0} size={13}>Security leaders,</TypedT>
      <TypedT id="rv2" x={X + 8} y={106} w={130} t0={2.0} t1={2.35} size={13}>meet in New York.</TypedT>
      <rect x={X + 200.5} y="98.5" width="64" height="13" stroke="#666" fill="none" />
      <MonoT x={X + 232} y={107} size={5} anchor="middle">Register</MonoT>
      <G t={{ opacity: [[0, 0], [1.15, 0], [1.25, 1], [2.4, 1], [2.6, 0], [d, 0]] }}>
        <EdgeBox x={X + 4} y={80} w={150} h={32} />
      </G>

      {/* speakers ↓ / stories ↑ — the person drags stories above speakers */}
      <G t={{ y: ab(0, 40, 3.0, 3.8, d) }}>
        <rect x={X + 0.5} y="126.5" width={W} height="34" fill="#202020" stroke="#333" />
        <MonoT x={X + 6} y={135} size={5} color="#777">Speakers</MonoT>
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <rect x={X + 6.5 + k * 68} y="140.5" width="14" height="14" stroke="#555" fill="none" />
            <rect x={X + 25 + k * 68} y="144" width="34" height="2" fill="#555" />
            <rect x={X + 25 + k * 68} y="149" width="24" height="2" fill="#444" />
          </g>
        ))}
      </G>
      <G t={{ y: ab(0, -40, 3.0, 3.8, d) }}>
        <rect x={X + 0.5} y="166.5" width={W} height="34" fill="#202020" stroke="#333" />
        <MonoT x={X + 6} y={175} size={5} color="#777">Customer stories</MonoT>
        <SansT x={X + 6} y={190} size={8.5}>“Our strongest rollout, with zero surprises.”</SansT>
        <G t={{ opacity: [[0, 0], [2.85, 0], [2.95, 1], [3.9, 1], [4.1, 0], [d, 0]] }}>
          <EdgeBox x={X} y={166} w={W} h={34} />
        </G>
      </G>

      {/* footer */}
      <rect x={X + 0.5} y="206.5" width={W} height="12" fill="#202020" stroke="#333" />

      {/* live */}
      <GoLive id="lit" t={5.2} boxes={boxes} />

      <Person
        t={{
          x: [[0, 300], [0.4, 300], [1.1, 90], [2.4, 90], [2.85, 200], [3.8, 200], [4.7, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.1, 96], [2.4, 96], [2.85, 184], [3.0, 184], [3.8, 144], [4.7, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [5.4, 1], [5.8, 0], [d, 0]],
          scale: [[0, 1], [1.1, 1], [1.17, 0.82], [1.27, 1], [2.85, 1], [2.92, 0.85], [3.8, 0.85], [3.9, 1], [4.7, 1], [4.77, 0.82], [4.87, 1], [d, 1]],
        }}
      />
    </>
  );
}

const PANELS = [AskLiteral, BuildLiteral, ReviewLiteral];

export function ProductFragments() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => {
      if (phase === 2) { setCycle((c) => c + 1); setPhase(0); }
      else setPhase((phase + 1) as Phase);
    }, PHASE_S[phase] * 1000 + 300);
    return () => clearTimeout(t);
  }, [phase, inView, reduce]);

  return (
    <div ref={ref} className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
      {PANELS.map((Panel, i) => {
        const idx = i as Phase;
        // rest states are never empty: before = the page as it was, after = with the change
        const mode: Mode = reduce || phase > idx ? "after" : phase === idx ? "play" : "before";
        return (
          <Step key={i} index={idx} phase={reduce ? 3 : phase} cycle={cycle}>
            <div className={cn("relative aspect-[4/3] w-full border bg-[#1c1c1c] transition-colors duration-700", !reduce && phase === idx ? "border-[#4a4a4a]" : "border-dark-grey")}>
              <PanelCtx.Provider value={{ mode, dur: PHASE_S[idx] }}>
                <svg aria-hidden viewBox="0 0 320 240" fill="none" className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", mode === "play" || reduce ? "opacity-100" : "opacity-45")}>
                  <Panel />
                </svg>
              </PanelCtx.Provider>
            </div>
          </Step>
        );
      })}
    </div>
  );
}

function Step({ index, phase, cycle, children }: { index: Phase; phase: number; cycle: number; children: React.ReactNode }) {
  const active = phase === index;
  const done = phase > index;
  const step = STEPS[index];
  return (
    <div className="flex flex-col gap-5">
      {children}
      <div className="relative h-px w-full overflow-hidden bg-dark-grey">
        <motion.div
          key={`${cycle}-${active}`}
          className="absolute inset-0 origin-left bg-off-white"
          initial={{ scaleX: active ? 0 : done ? 1 : 0 }}
          animate={{ scaleX: active || done ? 1 : 0 }}
          transition={{ duration: active ? PHASE_S[index] + 0.3 : 0.6, ease: active ? "linear" : "easeInOut" }}
        />
      </div>
      <div className={cn("flex flex-col gap-2 transition-colors duration-700", active ? "text-off-white" : "text-off-white-light")}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm uppercase leading-none tracking-tight">{step.label}</p>
          <ActorTag actor={step.actor} label={step.who} />
        </div>
        <p className="text-xl leading-7">{step.title}</p>
      </div>
    </div>
  );
}

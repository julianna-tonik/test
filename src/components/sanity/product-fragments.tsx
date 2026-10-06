"use client";

import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Actor, ActorTag } from "./actor";

/**
 * Hero visual: three small product fragments (Ask → Build → Review), drawn as
 * graphics, not UI copy. Same language as the example scenes:
 * grid blocks, dashed edge + nodes = AI at work, solid edge + cursor = a person.
 */

type Phase = 0 | 1 | 2;
const PHASE_S: Record<Phase, number> = { 0: 3.8, 1: 3.6, 2: 4.8 };

const STEPS: { label: string; title: string; actor: Actor; who: string }[] = [
  { label: "01 Ask", title: "Ask for the page", actor: "human", who: "You" },
  { label: "02 Build", title: "Watch it assemble", actor: "ai", who: "AI" },
  { label: "03 Review", title: "Review the live draft", actor: "human", who: "Your team" },
];

const BG = "#1c1c1c";
const GRID = "#424242";
const LINE = "#383838";
const SOFT = "#555";
const MID = "#888";
const EDGE = "#9a9a9a";
const HI = "#efefef";
const io = [0.65, 0, 0.35, 1] as const;

/* ── timeline engine: each panel plays its keyframes once while its phase is active ── */

type Mode = "before" | "play" | "after";
type V = number | string;
type Track = [number, V][];
const PanelCtx = createContext<{ mode: Mode; dur: number }>({ mode: "before", dur: 1 });

const ab = (a: V, b: V, t0: number, t1: number, dur: number): Track => [[0, a], [t0, a], [t1, b], [dur, b]];

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
const G = ({ t, linear, ...rest }: GP) => <motion.g {...useSeq(t, linear)} {...rest} />;
type RP = React.ComponentProps<typeof motion.rect> & { t: Record<string, Track>; linear?: string[] };
const R = ({ t, linear, ...rest }: RP) => <motion.rect {...useSeq(t, linear)} {...rest} />;

const useDur = () => useContext(PanelCtx).dur;

/* ── primitives ── */

const C = 10;
const cellsPath = (x: number, y: number, cols: number, rows: number) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) d += `M${x + k * C + 0.5} ${y + r * C + 0.5}h${C}v${C}h${-C}Z`;
  return d;
};

function Node({ x, y, color = HI }: { x: number; y: number; color?: string }) {
  return <rect x={x - 2} y={y - 2} width="4.5" height="4.5" fill={BG} stroke={color} strokeWidth="0.75" />;
}

function EdgeBox({ x, y, w, h, dashed, color = HI, nodes = true }: { x: number; y: number; w: number; h: number; dashed?: boolean; color?: string; nodes?: boolean }) {
  const x0 = x + 0.5, y0 = y + 0.5;
  return (
    <>
      <rect x={x0} y={y0} width={w} height={h} stroke={color} strokeWidth="1" strokeDasharray={dashed ? "4 3" : undefined} fill="none" />
      {nodes && [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].map(([a, b], i) => <Node key={i} x={a} y={b} color={color} />)}
    </>
  );
}

function Header({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <line x1="0" y1="32.5" x2="320" y2="32.5" stroke={LINE} />
      {children}
    </>
  );
}

function Cursor() {
  return <path d="M0 0L11.6 7L6.3 8.1L3.7 13.2Z" fill={HI} stroke={BG} strokeWidth="1" strokeLinejoin="round" />;
}

/* ── 01 ASK: a person writes a request; AI picks it up ── */

function AskPanel() {
  const d = useDur();
  const caretX: Track = [[0, 24], [0.3, 24], [1.4, 214], [1.42, 24], [2.1, 134], [d, 134]];
  const caretY: Track = [[0, 190], [1.41, 190], [1.42, 202], [d, 202]];
  return (
    <>
      <Header>
        {/* chat icon */}
        <path d="M16.5 11.5h14v10h-8l-3 3v-3h-3z" stroke={MID} strokeWidth="0.75" fill="none" />
      </Header>

      {/* composer: typed as placeholder lines */}
      <rect x="12.5" y="178.5" width="295" height="46" stroke={LINE} fill="none" />
      <G t={{ opacity: ab(1, 0, 2.5, 2.7, d) }}>
        <R t={{ scaleX: ab(0, 1, 0.3, 1.4, d) }} linear={["scaleX"]} x={24} y={192} width={190} height={5} fill="#5a5a5a" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
        <R t={{ scaleX: ab(0, 1, 1.42, 2.1, d) }} linear={["scaleX"]} x={24} y={204} width={110} height={5} fill="#5a5a5a" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
        <R t={{ x: caretX, y: caretY, opacity: [[0, 0], [0.2, 1], [2.2, 1], [2.3, 0], [d, 0]] }} linear={["x"]} x={0} y={0} width={1} height={9} fill={HI} />
      </G>
      {/* send (icon only) */}
      <G t={{ opacity: [[0, 0.45], [2.2, 0.45], [2.35, 1], [2.9, 1], [3.2, 0.45], [d, 0.45]] }}>
        <rect x="278.5" y="190.5" width="20" height="20" stroke={HI} fill="none" />
        <path d="M288.5 205v-9M284.5 199.5l4-4 4 4" stroke={HI} strokeWidth="1" fill="none" />
      </G>

      {/* the sent request, in the thread — a person (solid mark) */}
      <G t={{ opacity: ab(0, 1, 2.5, 2.9, d), y: ab(14, 0, 2.5, 3.0, d) }}>
        <rect x="96.5" y="52.5" width="200" height="42" stroke={SOFT} fill="#222" />
        <rect x="108" y="64" width="170" height="5" fill="#777" />
        <rect x="108" y="76" width="100" height="5" fill="#777" />
        <circle cx="304" cy="99" r="3" fill={HI} />
      </G>

      {/* AI picks it up — dashed mark + working dots */}
      <G t={{ opacity: ab(0, 1, 3.0, 3.3, d) }}>
        <circle cx="24" cy="120" r="4.5" stroke={MID} strokeDasharray="1.6 1.6" fill="none" />
        {[0, 1, 2].map((i) => (
          <R
            key={i}
            t={{ opacity: [[0, 0.3], [3.1 + i * 0.1, 0.3], [3.3 + i * 0.1, 1], [3.55 + i * 0.1, 0.3], [d, 0.6]] }}
            x={36 + i * 8}
            y={118}
            width="4"
            height="4"
            fill={MID}
          />
        ))}
      </G>
    </>
  );
}

/* ── 02 BUILD: AI assembles the page from approved blocks ── */

const BLOCKS: { x: number; y: number; cols: number; rows: number }[][] = [
  [{ x: 40, y: 48, cols: 24, rows: 1 }],
  [{ x: 40, y: 64, cols: 24, rows: 5 }],
  [{ x: 40, y: 122, cols: 24, rows: 1 }],
  [{ x: 40, y: 140, cols: 7, rows: 4 }, { x: 125, y: 140, cols: 7, rows: 4 }, { x: 210, y: 140, cols: 7, rows: 4 }],
  [{ x: 40, y: 188, cols: 24, rows: 3 }],
];

function BuildPanel() {
  const d = useDur();
  return (
    <>
      <Header>
        <path d="M16.5 11.5h5v5h-5zM23.5 11.5h5v5h-5zM16.5 18.5h5v5h-5zM23.5 18.5h5v5h-5z" stroke={MID} strokeWidth="0.75" fill="none" />
        {BLOCKS.map((_, i) => (
          <g key={i}>
            <rect x={252.5 + i * 10} y="13.5" width="6" height="6" stroke={SOFT} fill="none" />
            <R t={{ opacity: ab(0, 1, 0.75 + i * 0.6, 0.85 + i * 0.6, d) }} x={254 + i * 10} y={15} width="3" height="3" fill={MID} />
          </g>
        ))}
      </Header>
      <rect x="36.5" y="44.5" width="248" height="182" stroke="#2e2e2e" fill="none" />
      {BLOCKS.map((group, i) => {
        const s = 0.25 + i * 0.6;
        return (
          <G key={i} t={{ opacity: ab(0, 1, s, s + 0.25, d), y: ab(-10, 0, s, s + 0.5, d) }}>
            {group.map((b, j) => (
              <g key={j}>
                <rect x={b.x + 0.5} y={b.y + 0.5} width={b.cols * C} height={b.rows * C} fill={BG} />
                <path d={cellsPath(b.x, b.y, b.cols, b.rows)} stroke={GRID} fill="none" />
                <G t={{ opacity: [[0, 0], [s, 0], [s + 0.15, 1], [s + 0.7, 1], [s + 0.9, 0], [d, 0]] }}>
                  <EdgeBox x={b.x} y={b.y} w={b.cols * C} h={b.rows * C} dashed />
                </G>
                <G t={{ opacity: ab(0, 1, s + 0.7, s + 0.9, d) }}>
                  <rect x={b.x + 0.5} y={b.y + 0.5} width={b.cols * C} height={b.rows * C} stroke={EDGE} fill="none" />
                </G>
              </g>
            ))}
          </G>
        );
      })}
    </>
  );
}

/* ── 03 REVIEW: a person edits, then switches the page live ── */

function ReviewPanel() {
  const d = useDur();
  const id = useId().replace(/:/g, "");
  return (
    <>
      <Header>
        {/* address bar */}
        <rect x="16.5" y="10.5" width="120" height="12" stroke={LINE} fill="none" />
        <rect x="23" y="15" width="56" height="3" fill="#444" />
        {/* draft → live switch: a state, not a button */}
        <G t={{ opacity: ab(1, 0, 3.5, 3.7, d) }}>
          <text x="238" y="19.5" fill={MID} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>DRAFT</text>
        </G>
        <G t={{ opacity: ab(0, 1, 3.6, 3.9, d) }}>
          <text x="245" y="19.5" fill={HI} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>LIVE</text>
        </G>
        <rect x="272.5" y="9.5" width="32" height="14" stroke={SOFT} fill="none" />
        <R t={{ opacity: ab(0, 1, 3.5, 3.85, d) }} x={273} y={10} width={31} height={13} fill="#333" />
        <R t={{ x: ab(0, 16, 3.45, 3.85, d), fill: ab(MID, HI, 3.45, 3.85, d) }} x={275} y={12} width={10} height={9} />
      </Header>

      {/* the page from step 02, rendered */}
      <G t={{ opacity: ab(0, 1, 0, 0.5, d) }}>
        <rect x="40.5" y="48.5" width="240" height="10" fill="#242424" />
        <rect x="46" y="52" width="24" height="3" fill="#555" />
        <rect x="40.5" y="64.5" width="240" height="50" fill="#262626" stroke="#333" />
        <R t={{ scaleX: ab(1, 0.72, 1.75, 2.2, d) }} x={52} y={76} width={150} height={6} fill="#9a9a9a" style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }} />
        <rect x="52" y="88" width="96" height="6" fill="#9a9a9a" />
        <rect x="52" y="102" width="60" height="3" fill="#555" />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={52 + i * 46} y="124" width="26" height="6" fill="#3a3a3a" />)}
        {[40, 125, 210].map((x) => (
          <g key={x}>
            <rect x={x + 0.5} y="140.5" width="70" height="40" fill="#242424" stroke="#333" />
            <rect x={x + 7} y="160" width="44" height="3" fill="#555" />
            <rect x={x + 7} y="168" width="30" height="3" fill="#444" />
          </g>
        ))}
        <rect x="40.5" y="188.5" width="240" height="30" fill="#262626" stroke="#333" />
        <rect x="52" y="201" width="80" height="4" fill="#666" />
        <rect x="234" y="198" width="36" height="10" fill="#444" />
      </G>

      {/* the person's edit: solid edge on the headline */}
      <G t={{ opacity: [[0, 0], [1.55, 0], [1.65, 1], [2.6, 1], [2.9, 0], [d, 0]] }}>
        <EdgeBox x={47} y={71} w={160} h={28} />
      </G>

      {/* goes live: light sweep across the page */}
      <defs>
        <linearGradient id={`hg${id}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`hm${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="240">
          <R t={{ x: ab(-120, 340, 3.8, 4.6, d) }} y={40} width={110} height={200} fill={`url(#hg${id})`} />
        </mask>
      </defs>
      <g mask={`url(#hm${id})`} stroke="#bdbdbd" fill="none">
        <rect x="40.5" y="48.5" width="240" height="10" />
        <rect x="40.5" y="64.5" width="240" height="50" />
        {[40, 125, 210].map((x) => <rect key={x} x={x + 0.5} y="140.5" width="70" height="40" />)}
        <rect x="40.5" y="188.5" width="240" height="30" />
      </g>

      {/* the person: cursor goes to the headline, edits, then flips the switch */}
      <G
        t={{
          x: [[0, 300], [0.6, 300], [1.5, 150], [2.4, 150], [3.3, 292], [d, 292]],
          y: [[0, 236], [0.6, 236], [1.5, 84], [2.4, 84], [3.3, 17], [d, 17]],
          opacity: [[0, 0], [0.6, 0], [0.8, 1], [4.1, 1], [4.5, 0], [d, 0]],
          scale: [[0, 1], [1.5, 1], [1.58, 0.82], [1.68, 1], [3.35, 1], [3.43, 0.82], [3.53, 1], [d, 1]],
        }}
      >
        <Cursor />
      </G>
    </>
  );
}

const PANELS = [AskPanel, BuildPanel, ReviewPanel];

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
        const mode: Mode = reduce ? "after" : phase === idx ? "play" : phase > idx ? "after" : "before";
        return (
          <Step key={i} index={idx} phase={reduce ? 3 : phase} cycle={cycle}>
            <div className={cn("relative aspect-[4/3] w-full border bg-[#1c1c1c] transition-colors duration-700", !reduce && phase === idx ? "border-[#4a4a4a]" : "border-dark-grey")}>
              <PanelCtx.Provider value={{ mode, dur: PHASE_S[idx] }}>
                <svg key={`${cycle}-${mode}`} viewBox="0 0 320 240" fill="none" className="absolute inset-0 h-full w-full">
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

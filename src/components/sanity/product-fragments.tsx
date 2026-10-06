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
  return (
    <>
      <Header>
        {/* chat icon — header content sits 10 in from every edge */}
        <path d="M10.5 10.5h14v10h-8l-3 3v-3h-3z" stroke={MID} strokeWidth="0.75" fill="none" />
      </Header>

      {/* composer: the request "types" as placeholder lines filling left → right */}
      <rect x="10.5" y="178.5" width="299" height="46" stroke={LINE} fill="none" />
      <G t={{ opacity: ab(1, 0, 2.5, 2.7, d) }}>
        <R t={{ scaleX: ab(0, 1, 0.3, 1.4, d) }} linear={["scaleX"]} x={22} y={192} width={190} height={5} fill="#5a5a5a" style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }} />
        <R t={{ scaleX: ab(0, 1, 1.42, 2.1, d) }} linear={["scaleX"]} x={22} y={204} width={110} height={5} fill="#5a5a5a" style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }} />
      </G>
      {/* send (icon only, arrow points where the message goes) */}
      <G t={{ opacity: [[0, 0.45], [2.2, 0.45], [2.35, 1], [2.9, 1], [3.2, 0.45], [d, 0.45]] }}>
        <rect x="279.5" y="191.5" width="20" height="20" stroke={HI} fill="none" />
        <path d="M284.5 201.5h10M290.5 197.5l4 4-4 4" stroke={HI} strokeWidth="1" fill="none" />
      </G>

      {/* the sent request, in the thread — a person (solid avatar, bottom-aligned to the bubble) */}
      <G t={{ opacity: ab(0, 1, 2.5, 2.9, d), y: ab(14, 0, 2.5, 3.0, d) }}>
        <rect x="88.5" y="52.5" width="200" height="42" stroke={SOFT} fill="#222" />
        <rect x="100" y="64" width="170" height="5" fill="#777" />
        <rect x="100" y="76" width="100" height="5" fill="#777" />
        <circle cx="302" cy="88.5" r="6" fill={HI} />
      </G>

      {/* AI picks it up — dashed avatar + working dots */}
      <G t={{ opacity: ab(0, 1, 3.0, 3.3, d) }}>
        <circle cx="16.5" cy="120.5" r="6" stroke={MID} strokeDasharray="1.8 1.8" fill="none" />
        {[0, 1, 2].map((i) => (
          <R
            key={i}
            t={{ opacity: [[0, 0.3], [3.1 + i * 0.1, 0.3], [3.3 + i * 0.1, 1], [3.55 + i * 0.1, 0.3], [d, 0.6]] }}
            x={30 + i * 8}
            y={118.5}
            width="4"
            height="4"
            fill={MID}
          />
        ))}
      </G>
    </>
  );
}

/* ── shared page layout: the same page is built in 02 and reviewed in 03 ── */

const PAGE = { x: 40, w: 240 };
const SLOT = {
  hero: { y: 48, h: 50 },
  logos: { y: 110, h: 10 },
  cards: { y: 132, h: 40 },
  cta: { y: 184, h: 30 },
};
const CARD_X = [40, 125, 210];

/* ── 02 BUILD: AI places approved blocks into the page, one by one, in place ── */

const BUILD: { key: keyof typeof SLOT; cells: { x: number; cols: number }[] }[] = [
  { key: "hero", cells: [{ x: 40, cols: 24 }] },
  { key: "logos", cells: [{ x: 40, cols: 24 }] },
  { key: "cards", cells: CARD_X.map((x) => ({ x, cols: 7 })) },
  { key: "cta", cells: [{ x: 40, cols: 24 }] },
];

function BuildPanel() {
  const d = useDur();
  return (
    <>
      <Header>
        <path d="M10.5 10.5h5v5h-5zM17.5 10.5h5v5h-5zM10.5 17.5h5v5h-5zM17.5 17.5h5v5h-5z" stroke={MID} strokeWidth="0.75" fill="none" />
      </Header>
      <rect x="36.5" y="44.5" width="248" height="174" stroke="#2e2e2e" fill="none" />
      {BUILD.map((b, i) => {
        const s = 0.3 + i * 0.75;
        const { y, h } = SLOT[b.key];
        return (
          <g key={b.key}>
            {/* cells settle in place — no travel, no overlap */}
            <G t={{ opacity: ab(0, 1, s + 0.15, s + 0.5, d) }}>
              {b.cells.map((c) => (
                <path key={c.x} d={cellsPath(c.x, y, c.cols, h / C)} stroke={GRID} fill="none" />
              ))}
            </G>
            {/* AI at work: dashed edge + nodes, then a clean swap to a solid edge */}
            <G t={{ opacity: [[0, 0], [s, 0], [s + 0.15, 1], [s + 0.6, 1], [s + 0.72, 0], [d, 0]] }}>
              <EdgeBox x={PAGE.x} y={y} w={PAGE.w} h={h} dashed />
            </G>
            <G t={{ opacity: ab(0, 1, s + 0.6, s + 0.72, d) }}>
              {b.cells.map((c) => (
                <rect key={c.x} x={c.x + 0.5} y={y + 0.5} width={c.cols * C} height={h} stroke={EDGE} fill="none" />
              ))}
            </G>
          </g>
        );
      })}
    </>
  );
}

/* ── 03 REVIEW: a person edits the headline, reorders a section, then switches the page live ── */

const BAR = "#5a5a5a";
const BLOCK = { fill: "#252525", stroke: "#333" };

function ReviewPanel() {
  const d = useDur();
  const id = "review";
  return (
    <>
      <Header>
        {/* page address, as a placeholder line */}
        <rect x="10" y="15" width="64" height="3" fill="#444" />
        {/* draft → live switch: a state, not a button */}
        <G t={{ opacity: ab(1, 0, 4.85, 5.05, d) }}>
          <text x="271" y="19.5" textAnchor="end" fill={MID} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>DRAFT</text>
        </G>
        <G t={{ opacity: ab(0, 1, 4.95, 5.25, d) }}>
          <text x="271" y="19.5" textAnchor="end" fill={HI} fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>LIVE</text>
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

      {/* page frame: dim while draft, lit once live (stays lit) */}
      <R t={{ stroke: ab("#2e2e2e", EDGE, 5.2, 5.7, d) }} x={36.5} y={44.5} width={248} height={174} fill="none" />

      {/* hero — the headline gets rewritten */}
      <rect x="40.5" y="48.5" width="240" height="50" {...BLOCK} />
      <R
        t={{ scaleX: [[0, 1], [1.3, 1], [1.5, 0], [2.1, 0.7], [d, 0.7]] }}
        linear={["scaleX"]}
        x={52} y={62} width={150} height={6} fill={BAR}
        style={{ transformBox: "fill-box", originX: 0, originY: 0.5 }}
      />
      <rect x="52" y="74" width="96" height="6" fill={BAR} />
      <G t={{ opacity: [[0, 0], [1.15, 0], [1.25, 1], [2.3, 1], [2.5, 0], [d, 0]] }}>
        <EdgeBox x={47} y={56} w={160} h={30} />
      </G>

      {/* cards move up as the logo row is dragged below them */}
      <G t={{ y: ab(0, -22, 2.9, 3.7, d) }}>
        {CARD_X.map((x) => (
          <g key={x}>
            <rect x={x + 0.5} y="132.5" width="70" height="40" {...BLOCK} />
            <rect x={x + 8} y="150" width="40" height="3" fill={BAR} />
          </g>
        ))}
      </G>
      <G t={{ y: ab(0, 52, 2.9, 3.7, d) }}>
        <rect x="40.5" y="110.5" width="240" height="10" {...BLOCK} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={58 + i * 58} y="114" width="28" height="3" fill={BAR} />)}
        <G t={{ opacity: [[0, 0], [2.75, 0], [2.85, 1], [3.8, 1], [4.0, 0], [d, 0]] }}>
          <EdgeBox x={40} y={110} w={240} h={10} />
        </G>
      </G>

      {/* cta */}
      <rect x="40.5" y="184.5" width="240" height="30" {...BLOCK} />
      <rect x="52" y="198" width="80" height="3" fill={BAR} />

      {/* goes live: light sweep across the page */}
      <defs>
        <linearGradient id={`hg${id}`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`hm${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="240">
          <R t={{ x: ab(-160, 340, 5.2, 6.4, d) }} y={40} width={160} height={200} fill={`url(#hg${id})`} />
        </mask>
      </defs>
      <g mask={`url(#hm${id})`} stroke="#bdbdbd" fill="none">
        <rect x="40.5" y="48.5" width="240" height="50" />
        {CARD_X.map((x) => <rect key={x} x={x + 0.5} y="110.5" width="70" height="40" />)}
        <rect x="40.5" y="162.5" width="240" height="10" />
        <rect x="40.5" y="184.5" width="240" height="30" />
      </g>

      {/* the person: edits the headline, drags the logo row down, flips the switch */}
      <G
        t={{
          x: [[0, 300], [0.4, 300], [1.15, 130], [2.2, 130], [2.75, 170], [3.7, 170], [4.7, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.15, 66], [2.2, 66], [2.75, 116], [2.9, 116], [3.7, 168], [4.7, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [5.4, 1], [5.8, 0], [d, 0]],
          scale: [[0, 1], [1.15, 1], [1.22, 0.82], [1.32, 1], [2.75, 1], [2.82, 0.85], [3.7, 0.85], [3.8, 1], [4.7, 1], [4.77, 0.82], [4.87, 1], [d, 1]],
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
        const mode: Mode = !reduce && phase === idx ? "play" : "after";
        return (
          <Step key={i} index={idx} phase={reduce ? 3 : phase} cycle={cycle}>
            <div className={cn("relative aspect-[4/3] w-full border bg-[#1c1c1c] transition-colors duration-700", !reduce && phase === idx ? "border-[#4a4a4a]" : "border-dark-grey")}>
              <PanelCtx.Provider value={{ mode, dur: PHASE_S[idx] }}>
                <svg key={`${cycle}-${mode}`} aria-hidden viewBox="0 0 320 240" fill="none" className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", mode === "play" || reduce ? "opacity-100" : "opacity-45")}>
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

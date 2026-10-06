"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { easeOut } from "./shared";

/**
 * LITERAL VERSION (founder-readable): app windows with names, real copy, statuses and numbers,
 * in the same monochrome Vibe Fixer language and the same loop engine.
 * Example-request illustrations in the Vibe Fixer video language:
 * the page grid is always there (outlines only) and the request plays as an
 * event on top of it, in a loop.
 * Selection runs along the blocks' own edge (no extra frame), with small nodes —
 * dashed = AI is working on it, solid light = protected by your rules,
 * grey edge = changed.
 */

const D = 7; // loop length (s)
const RESULT = 6; // moment shown for reduced motion
const BG = "#212121";
const GRID = "#424242";
const CHANGED_CELL = "#5a5a5a";
const CHANGED_EDGE = "#9a9a9a";
const SEL = "#dcdcdc";
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


/** Small square node, as on the Vibe Fixer selections. */
function Node({ x, y }: { x: number; y: number }) {
  return <rect x={x - 2} y={y - 2} width="4.5" height="4.5" fill="#4a4a4a" stroke="#8a8a8a" strokeWidth="0.75" />;
}


/** Whole-scene fade that hides the reset between loops. */
const FADE: Track = [[0, 1], [6.25, 1], [6.5, 0], [6.75, 0], [D, 1]];

/* ───────────────────────── literal kit: windows, real copy, simple shapes (founder-readable) ─────────────────────────
 * Spacing follows the Figma file: window header 32, padding 12 (+1 for the frame), gaps 8, rows padded 8/12.
 * On narrow screens the windows of a scene stack instead of sitting side by side.
 */

const INK = "#cfcfcf";
const WIN = "#1c1c1c";
const LINE2 = "#3a3a3a";
const BLOCK_EDGE = "#3a3a3a";
const BAR = "#4f4f4f";
const PHOTO = "#666";
const BTN = "#424242";
const HEAD = 32;
const IN = 13; // frame + padding

/** True below the `sm` breakpoint (after mount; SSR renders the desktop layout). */
export function useNarrow() {
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

/** Flip a 0–1 opacity track. */
const inv = (t: Track): Track => t.map(([k, v]) => [k, 1 - (v as number)]);

function Mono({ x, y, children, color = MUTED, size = 7, anchor }: { x: number; y: number; children: string; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} letterSpacing="0.2" textAnchor={anchor} style={{ fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>
      {children}
    </text>
  );
}

function Sans({ x, y, children, color = INK, size = 10, anchor }: { x: number; y: number; children: string; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} fill={color} fontSize={size} letterSpacing="-0.2" textAnchor={anchor} style={{ fontFamily: "var(--font-sans)" }}>
      {children}
    </text>
  );
}

/** Vibe Fixer node: small filled grey square. */
function GNode({ x, y }: { x: number; y: number }) {
  return <rect x={x - 2} y={y - 2} width="4.5" height="4.5" fill="#4a4a4a" stroke="#8a8a8a" strokeWidth="0.75" />;
}

function corners(x: number, y: number, w: number, h: number) {
  const x0 = x + 0.5, y0 = y + 0.5;
  return [[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]] as const;
}

/**
 * A block whose own outline changes state — never a second line on top of it:
 * solid (resting) → dashed + nodes while AI works (`ai`) → solid again; `sel` = a person's solid selection.
 */
function Block({ x, y, w, h, ai, sel, children, fill = "#202020" }: { x: number; y: number; w: number; h: number; ai?: Track; sel?: Track; children?: React.ReactNode; fill?: string }) {
  const r = { x: x + 0.5, y: y + 0.5, width: w, height: h };
  const rest = ai && sel ? null : ai ? inv(ai) : sel ? inv(sel) : null;
  return (
    <>
      <rect {...r} fill={fill} stroke="none" />
      {children}
      {rest ? (
        <G t={{ opacity: rest }}>
          <rect {...r} fill="none" stroke={BLOCK_EDGE} />
        </G>
      ) : !ai && !sel ? (
        <rect {...r} fill="none" stroke={BLOCK_EDGE} />
      ) : null}
      {ai && (
        <G t={{ opacity: ai }}>
          <rect {...r} fill="none" stroke={INK} strokeDasharray="4 3" />
          {corners(x, y, w, h).map(([a, b], i) => <GNode key={i} x={a} y={b} />)}
        </G>
      )}
      {sel && (
        <G t={{ opacity: sel }}>
          <rect {...r} fill="none" stroke={INK} />
          {corners(x, y, w, h).map(([a, b], i) => <GNode key={i} x={a} y={b} />)}
        </G>
      )}
    </>
  );
}

/** App window: frame + 32-unit title bar; `right` sits at the right edge of the bar. */
function Win({ x, y, w, h, title, right }: { x: number; y: number; w: number; h: number; title: string; right?: React.ReactNode }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height={h} fill={WIN} stroke={LINE2} />
      <line x1={x} y1={y + HEAD + 0.5} x2={x + w} y2={y + HEAD + 0.5} stroke={LINE2} />
      <Mono x={x + IN} y={y + 19}>{title}</Mono>
      {right}
    </>
  );
}

function Check({ x, y, s = 1, color = SEL }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x} ${y + 3 * s}l${2.2 * s} ${2.2 * s} ${4.4 * s}-${4.8 * s}`} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

function SmallLock({ x, y, color = "#9a9a9a" }: { x: number; y: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth="0.75" fill="none">
      <rect x={x + 0.4} y={y + 2.9} width="4.6" height="3.6" />
      <path d={`M${x + 1.3} ${y + 2.9}v-0.8a1.4 1.4 0 0 1 2.8 0v0.8`} />
    </g>
  );
}

const HI2 = "#efefef";

/** Text that types in left → right (clip grows). */
function Typed({ id, x, y, w, t0, t1, children, size = 9, color = INK }: { id: string; x: number; y: number; w: number; t0: number; t1: number; children: string; size?: number; color?: string }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <R t={{ width: ev(0, w, t0, t1) }} x={x - 1} y={y - size} height={size * 1.6} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Sans x={x} y={y} size={size} color={color}>{children}</Sans>
      </g>
    </>
  );
}

/** A number that counts up between t0 and t1. */
function Count({ x, y, values, t0, t1, size = 14, color = INK, anchor }: { x: number; y: number; values: string[]; t0: number; t1: number; size?: number; color?: string; anchor?: "start" | "middle" | "end" }) {
  const step = (t1 - t0) / (values.length - 1);
  return (
    <>
      {values.map((v, i) => {
        const a = t0 + i * step, b = a + step;
        const last = i === values.length - 1;
        const t: Track = i === 0
          ? [[0, 1], [b - 0.02, 1], [b, 0], [6.6, 0], [6.62, 1], [D, 1]]
          : last
            ? [[0, 0], [a - 0.02, 0], [a, 1], [6.6, 1], [6.62, 0], [D, 0]]
            : [[0, 0], [a - 0.02, 0], [a, 1], [b - 0.02, 1], [b, 0], [D, 0]];
        return (
          <G key={i} t={{ opacity: t }}>
            <Sans x={x} y={y} size={size} color={color} anchor={anchor}>{v}</Sans>
          </G>
        );
      })}
    </>
  );
}

/** AI works on a block between t0 and t1: outline dashed with nodes, then back to solid. */
const aiWork = (t0: number, t1: number): Track => [[0, 0], [t0, 0], [t0 + 0.15, 1], [t1, 1], [t1 + 0.2, 0], [D, 0]];
/** Content of a block appears at t. */
const appear = (t: number) => show(t, 0.35);

/* small content shapes */
const Lines = ({ x, y, ws, gap = 7, h = 2.5, color = BAR }: { x: number; y: number; ws: number[]; gap?: number; h?: number; color?: string }) => (
  <>{ws.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={h} fill={color} />)}</>
);
/** A photo: filled grey circle. */
const Photo = ({ x, y, d = 12 }: { x: number; y: number; d?: number }) => <circle cx={x + d / 2} cy={y + d / 2} r={d / 2} fill={PHOTO} />;
/** A person: photo + two caption bars (Figma "Person"). */
const Person = ({ x, y, d = 12 }: { x: number; y: number; d?: number }) => (
  <>
    <Photo x={x} y={y} d={d} />
    <rect x={x + d + 5} y={y + d / 2 - 3.75} width="18" height="2.5" fill={BAR} />
    <rect x={x + d + 5} y={y + d / 2 + 1.75} width="15.5" height="2.5" fill={BAR} />
  </>
);
/** Persons spread evenly inside a row (padding 12, space-between). */
const spread = (x: number, w: number, n: number, pw = 35) => Array.from({ length: n }, (_, i) => x + 12 + (i * (w - 24 - pw)) / (n - 1));

type Layout = { vb: [number, number] };
type SceneProps = { narrow: boolean };

/* ───────────────────────── 01 · NYC Security Summit — built from the section library ───────────────────────── */

const LIBRARY = [["Hero", "Logos"], ["Features", "Stats"], ["Speakers", "Schedule"], ["Stories", "Form"]];

function Library({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cw = (w - 2 * IN - 8) / 2;
  const chipX = (c: number) => x + IN + c * (cw + 8);
  const chipY = (r: number) => y + 45 + r * 26;
  const picks = [
    { r: 0, c: 0, s: 0.6 },
    { r: 2, c: 0, s: 1.8 },
    { r: 3, c: 0, s: 3.0 },
  ];
  return (
    <>
      <Win x={x} y={y} w={w} h={h} title="Section library" />
      {LIBRARY.map((row, r) =>
        row.map((name, c) => {
          const p = picks.find((q) => q.r === r && q.c === c);
          return (
            <g key={name}>
              <Block x={chipX(c)} y={chipY(r)} w={cw} h={18}>
                <Mono x={chipX(c) + 9} y={chipY(r) + 11} size={6}>{name}</Mono>
                {p && (
                  <G t={{ opacity: appear(p.s) }}>
                    <rect x={chipX(c) + 0.5} y={chipY(r) + 0.5} width={cw} height="18" fill="#2a2a2a" stroke="#8a8a8a" />
                    <Mono x={chipX(c) + 9} y={chipY(r) + 11} size={6} color={SEL}>{name}</Mono>
                  </G>
                )}
              </Block>
            </g>
          );
        }),
      )}
      <G t={{ opacity: ev(1, 0, 4.4, 4.6) }}>
        <Mono x={x + IN} y={y + h - 14} size={6}>Assembling from library…</Mono>
      </G>
      <G t={{ opacity: appear(4.6) }}>
        <Check x={x + IN} y={y + h - 20} s={1.2} />
        <Mono x={x + IN + 14} y={y + h - 14} size={6} color={SEL}>Draft ready</Mono>
      </G>
    </>
  );
}

function EventPage({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const cx = x + IN, cw = w - 2 * IN;
  const heroH = h - 185; // the hero block takes the spare height
  const yP = y + 82 + heroH, yS = yP + 44, yF = yS + 38;
  return (
    <>
      <Win
        x={x}
        y={y}
        w={w}
        h={h}
        title="nyc-security-summit"
        right={
          <G t={{ opacity: appear(4.6) }}>
            <rect x={x + w - 44.5} y={y + 10.5} width="32" height="13" stroke="#8a8a8a" fill="none" />
            <Mono x={x + w - 28.5} y={y + 19} size={6} anchor="middle" color={SEL}>Draft</Mono>
          </G>
        }
      />
      <Block x={cx} y={y + 45} w={cw} h={21}>
        <rect x={cx + 13} y={y + 54} width="34" height="3" fill={BAR} />
        {[0, 1, 2].map((k) => <rect key={k} x={cx + cw - 77 + k * 24} y={y + 54} width="16" height="3" fill={BAR} />)}
      </Block>

      {/* hero */}
      <Block x={cx} y={y + 74} w={cw} h={heroH} ai={aiWork(0.9, 1.7)}>
        <G t={{ opacity: appear(1.1) }}>
          <Sans x={cx + 12} y={y + 74 + heroH / 2 + 1} size={13}>NYC Security Summit</Sans>
          <rect x={cx + 12} y={y + 74 + heroH / 2 + 7.5} width="70" height="2.5" fill={BAR} />
        </G>
      </Block>

      {/* speakers */}
      <Block x={cx} y={yP} w={cw} h={36} ai={aiWork(2.1, 2.9)}>
        <G t={{ opacity: appear(2.3) }}>
          {spread(cx, cw, 5).map((px) => <Person key={px} x={px} y={yP + 12} />)}
        </G>
      </Block>

      {/* customer proof */}
      <Block x={cx} y={yS} w={cw} h={30} ai={aiWork(3.3, 4.1)}>
        <G t={{ opacity: appear(3.5) }}>
          <Photo x={cx + 13} y={yS + 9} />
          <Lines x={cx + 33} y={yS + 10.5} ws={[Math.min(160, cw - 60), 110]} />
        </G>
      </Block>
      <Block x={cx} y={yF} w={cw} h={8} />
    </>
  );
}

const EVENT: Record<"wide" | "narrow", Layout> = { wide: { vb: [459, 230] }, narrow: { vb: [281, 414] } };
function SceneEvent({ narrow }: SceneProps) {
  return (
    <G t={{ opacity: FADE }}>
      {narrow ? (
        <>
          <Library x={0} y={0} w={280} h={172} />
          <EventPage x={0} y={184} w={280} h={229} />
        </>
      ) : (
        <>
          <Library x={0} y={0} w={166} h={229} />
          <EventPage x={178} y={0} w={280} h={229} />
        </>
      )}
    </G>
  );
}

/* ───────────────────────── 02 · AI Governance Report — findings first, gated download, staging ───────────────────────── */

const REPORT: Record<"wide" | "narrow", Layout> = { wide: { vb: [449, 225] }, narrow: { vb: [301, 280] } };
function SceneReport({ narrow }: SceneProps) {
  const X = IN, W = 274;
  const card = narrow ? { x: 0, y: 236, w: 300 } : { x: 312, y: 90, w: 136 };
  return (
    <G t={{ opacity: FADE }}>
      <Win x={0} y={0} w={300} h={224} title="ai-governance-report" />

      <Block x={X} y={45} w={W} h={34}>
        <Sans x={X + 13} y={66.5} size={11.5}>The AI Governance Report</Sans>
      </Block>

      {/* customer proof moves down, findings move to the top */}
      <G t={{ y: ev(0, 51, 1.0, 1.8) }}>
        <Block x={X} y={87.5} w={W} h={30}>
          <Photo x={X + 13} y={96.5} />
          <Lines x={X + 33} y={98} ws={[150, 100]} />
        </Block>
      </G>
      <G t={{ y: ev(0, -38, 1.0, 1.8) }}>
        <Block x={X} y={125.5} w={W} h={43} ai={aiWork(0.6, 1.9)}>
          {["73%", "4.2×", "12"].map((n, i) => (
            <g key={n}>
              <Sans x={X + 13 + i * 86.5} y={147} size={12}>{n}</Sans>
              <rect x={X + 13 + i * 86.5} y={153} width="34" height="2.5" fill={BAR} />
            </g>
          ))}
        </Block>
      </G>

      {/* form: work email, then download */}
      <G t={{ opacity: appear(2.2) }}>
        <Block x={X} y={176.5} w={W} h={34} ai={aiWork(2.2, 2.9)}>
          <rect x={X + 13.5} y={186} width="166" height="16" stroke="#555" fill="none" />
          <G t={{ opacity: ev(1, 0, 3.0, 3.1) }}>
            <Sans x={X + 20} y={196.5} size={7} color="#777">Work email</Sans>
          </G>
          <Typed id="rep-mail" x={X + 20} y={196.5} w={70} t0={3.1} t1={3.7} size={7}>jane@acme.com</Typed>
          <R t={{ fill: [[0, BTN], [3.8, BTN], [3.9, "#5a5a5a"], [4.2, BTN], [D, BTN]] }} x={X + 187} y={185.5} width="74" height="16" />
          <Mono x={X + 224} y={195.5} size={5.5} anchor="middle" color={HI2}>Download</Mono>
        </Block>
      </G>

      {/* staging preview */}
      <G t={{ opacity: show(4.6, 0.5), x: ev(-12, 0, 4.6, 5.2) }}>
        <rect x={card.x + 0.5} y={card.y + 0.5} width={card.w} height="43" fill={WIN} stroke="#8a8a8a" />
        <Check x={card.x + IN} y={card.y + 13} s={1.2} />
        <Mono x={card.x + IN + 14} y={card.y + 18.5} size={6.5} color={SEL}>Staging preview sent</Mono>
        <rect x={card.x + IN} y={card.y + 27} width="110" height="3" fill={BAR} />
      </G>
    </G>
  );
}

/* ───────────────────────── 03 · Homepage campaign — only the requested edits ───────────────────────── */

const EDITS = [
  { text: ["Replace hero headline"], at: 2.6, y: 45 },
  { text: ["Move customer logos", "above the product tour"], at: 4.0, y: 69 },
  { text: ["Swap in the Acme quote"], at: 5.3, y: 101 },
];

/** Picture placeholder: grey frame, sun and hills. */
function Picture({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="48" height="28" fill="#3a3a3a" />
      <circle cx={x + 33.5} cy={y + 8.5} r="2.5" fill="#5a5a5a" />
      <path d={`M${x} ${y + 28}V${y + 22}L${x + 13} ${y + 11}L${x + 23} ${y + 19}L${x + 30} ${y + 14}L${x + 48} ${y + 26}V${y + 28}Z`} fill={BAR} />
    </>
  );
}

const HOME: Record<"wide" | "narrow", Layout> = { wide: { vb: [461, 272] }, narrow: { vb: [251, 441] } };
function SceneHomepage({ narrow }: SceneProps) {
  const X = IN, W = 224;
  const ed = narrow ? { x: 0, y: 283, h: 157 } : { x: 262, y: 0, h: 271 };
  return (
    <G t={{ opacity: FADE }}>
      <Win x={0} y={0} w={250} h={271} title="homepage" />

      {/* protected: navigation + legal */}
      <Block x={X} y={45} w={W} h={24.5}>
        <rect x={X + 13} y={55.5} width="30" height="3" fill={BAR} />
        <SmallLock x={X + W - 18} y={53.5} />
      </Block>
      <Block x={X} y={234} w={W} h={24.5}>
        <rect x={X + 13} y={244.5} width="70" height="3" fill={BAR} />
        <SmallLock x={X + W - 18} y={242.5} />
      </Block>

      {/* hero headline replaced */}
      <Block x={X} y={77.5} w={W} h={33.5} ai={aiWork(1.2, 2.6)}>
        <G t={{ opacity: ev(1, 0, 1.6, 1.9) }}>
          <Sans x={X + 13} y={98} size={10.5}>Everything your team needs</Sans>
        </G>
        <Typed id="home-h" x={X + 13} y={98} w={170} t0={1.9} t1={2.5} size={10.5}>Security that ships with you</Typed>
      </Block>

      {/* logos move above the product tour */}
      <G t={{ y: ev(0, 29, 3.2, 4.0) }}>
        <Block x={X} y={119} w={W} h={46}>
          <Picture x={X + 13} y={128} />
          <Lines x={X + 69} y={137} ws={[110, 80]} />
        </Block>
      </G>
      <G t={{ y: ev(0, -54, 3.2, 4.0) }}>
        <Block x={X} y={173} w={W} h={21} ai={aiWork(2.9, 4.0)}>
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={X + 13 + i * 44} y={182} width="22" height="3" fill="#666" />)}
        </Block>
      </G>

      {/* quote swapped */}
      <Block x={X} y={202} w={W} h={24} ai={aiWork(4.5, 5.4)}>
        <G t={{ opacity: ev(1, 0, 4.7, 5.0) }}>
          <Sans x={X + 13} y={217} size={8}>“A tool our designers actually like.”</Sans>
        </G>
        <G t={{ opacity: ev(0, 1, 5.0, 5.3) }}>
          <Sans x={X + 13} y={217} size={8}>“We launch campaigns in days.” — Acme</Sans>
        </G>
      </Block>

      {/* requested edits */}
      <Win
        x={ed.x}
        y={ed.y}
        w={narrow ? 250 : 198}
        h={ed.h}
        title="Requested edits"
        right={<G t={{ opacity: appear(5.5) }}><Mono x={ed.x + (narrow ? 250 : 198) - IN} y={ed.y + 19} anchor="end" color={SEL}>3 changes</Mono></G>}
      />
      {EDITS.map((e, i) => (
        <g key={i}>
          <rect x={ed.x + IN + 0.5} y={ed.y + e.y + 0.5} width="11" height="11" stroke="#8a8a8a" fill="none" />
          <G t={{ opacity: show(e.at, 0.3) }}>
            <Check x={ed.x + IN + 3} y={ed.y + e.y + 3.5} s={0.9} />
          </G>
          {e.text.map((l, j) => <Sans key={j} x={ed.x + IN + 20} y={ed.y + e.y + 9 + j * 11} size={8.5}>{l}</Sans>)}
        </g>
      ))}
      <rect x={ed.x + IN + 0.5} y={ed.y + 125.5} width="11" height="11" stroke="#8a8a8a" fill="none" />
      <SmallLock x={ed.x + IN + 3.3} y={ed.y + 127.5} />
      <Sans x={ed.x + IN + 20} y={ed.y + 134} size={8.5} color="#888">Navigation and legal</Sans>
      <Sans x={ed.x + IN + 20} y={ed.y + 145} size={8.5} color="#888">stay unchanged</Sans>
    </G>
  );
}

/* ───────────────────────── 04 · Event conversion — a 50/50 test: A and B side by side ───────────────────────── */

const VARIANTS = {
  a: { head: "Join us in New York", cta: "Register", cw: 43, counts: ["0", "7", "15", "22", "31", "38"], rate: "2.9%" },
  b: { head: "Save your seat in NYC", cta: "Reserve my spot", cw: 66, counts: ["0", "9", "21", "34", "46", "57"], rate: "4.4%" },
};

function Variant({ x, y, w, b, at }: { x: number; y: number; w: number; b?: boolean; at: number }) {
  const v = b ? VARIANTS.b : VARIANTS.a;
  const px = x + IN, py = y + 45, pw = w - 26;
  return (
    <G t={{ opacity: show(at, 0.4), y: ev(8, 0, at, at + 0.5) }}>
      <Block x={x} y={y} w={w} h={148}>
        <Mono x={x + IN} y={y + 19} size={7} color={b ? SEL : MUTED}>{b ? "B" : "A"}</Mono>
        <Mono x={x + w - IN} y={y + 19} size={6.5} anchor="end">50%</Mono>
        <line x1={x} y1={y + 32.5} x2={x + w} y2={y + 32.5} stroke="#333" />
      </Block>
      <Block x={px} y={py} w={pw} h={55}>
        <Sans x={px + 13} y={py + 20} size={11}>{v.head}</Sans>
        <rect x={px + 13} y={py + 28} width={v.cw} height="14" fill={BTN} />
        <Mono x={px + 21} y={py + 37} size={5.5} color={HI2}>{v.cta}</Mono>
      </Block>
      <Mono x={px} y={y + 116} size={6}>Registrations</Mono>
      <Count x={px} y={y + 135} t0={2.2} t1={5.0} values={v.counts} size={15} color={b ? SEL : INK} />
      <G t={{ opacity: appear(5.1) }}>
        <Mono x={x + w - IN} y={y + 135} size={7} anchor="end" color={b ? SEL : MUTED}>{v.rate}</Mono>
      </G>
    </G>
  );
}

const AB: Record<"wide" | "narrow", Layout> = { wide: { vb: [435, 170] }, narrow: { vb: [281, 330] } };
function SceneAB({ narrow }: SceneProps) {
  const w = narrow ? 280 : 211;
  const foot = narrow ? 326 : 166;
  return (
    <G t={{ opacity: FADE }}>
      <Variant x={0} y={0} w={w} at={0.3} />
      <Variant x={narrow ? 0 : w + 12} y={narrow ? 160 : 0} w={w} b at={0.8} />
      <G t={{ opacity: appear(5.3) }}>
        <Mono x={0} y={foot} size={6} color={SEL}>B leading · +52%</Mono>
      </G>
    </G>
  );
}

const SCENES = [
  { Scene: SceneEvent, l: EVENT },
  { Scene: SceneReport, l: REPORT },
  { Scene: SceneHomepage, l: HOME },
  { Scene: SceneAB, l: AB },
];

export function RequestScene({ index, active, snapshot }: { index: number; active: boolean; snapshot?: boolean }) {
  const reduce = !!useReducedMotion() || !!snapshot;
  const narrow = useNarrow();
  const { Scene, l } = SCENES[index];
  const [w, h] = l[narrow ? "narrow" : "wide"].vb;
  return (
    <Ctx.Provider value={{ on: active && !reduce, reduce }}>
      <svg key={narrow ? "n" : "w"} aria-hidden viewBox={`0 0 ${w} ${h}`} fill="none" className="block h-auto w-full overflow-visible">
        <Scene narrow={narrow} />
      </svg>
    </Ctx.Provider>
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
      <G t={{ opacity: [[0, 0], [t, 0], [t + 0.25, 1], [t + 1.1, 1], [t + 1.5, 0.35], [6.6, 0.35], [6.62, 0], [D, 0]] }}>
        <rect x={x} y={27} width={M - 9} height={M - 9} fill={SEL} />
      </G>
      <G t={{ y: ev(0, 90, t + 0.45, t + 1.05), opacity: [[0, 0], [t + 0.4, 0], [t + 0.5, 1], [t + 1.0, 1], [t + 1.1, 0], [D, 0]] }}>
        <rect x={x} y={27} width={M - 9} height={M - 9} fill={SEL} />
      </G>
      <G t={{ opacity: [[0, 0], [t + 1.0, 0], [t + 1.1, 1], [t + 1.6, 1], [t + 2.0, 0.35], [6.6, 0.35], [6.62, 0], [D, 0]] }}>
        <rect x={x} y={117} width={M - 9} height={M - 9} fill={SEL} />
      </G>
    </>
  );
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
  const labels = ["IMPORT 01 · 640 PAGES", "IMPORT 02 · 410 PAGES", "IMPORT 03 · 950 PAGES"];
  const at = [1.6, 2.7, 5.2];
  // edits on the live site, each in a range that is already imported
  const edits = narrow ? [[2, 2.0], [6, 3.3], [3, 4.7]] : [[4, 2.0], [13, 3.3], [7, 4.7]];
  return (
    <Ctx.Provider value={{ on, reduce }}>
      <svg aria-hidden ref={ref} viewBox={narrow ? "0 0 301 206" : "0 0 620 196"} fill="none" className="block h-auto w-full overflow-visible" style={{ fontFamily: "var(--font-mono)" }}>
        {/* labels: "live" moves from Webflow to Sanity at the cutover */}
        <G t={{ opacity: [[0, 1], [5.4, 1], [5.8, 0.4], [6.5, 0.4], [6.62, 1], [D, 1]] }}>
          <text x="0" y="11" fill={MUTED} fontSize="11">WEBFLOW SITE</text>
        </G>
        <G t={{ opacity: ev(1, 0, 5.4, 5.7) }}>
          <text x="86" y="11" fill={MUTED} fontSize="11">— LIVE</text>
        </G>
        <text x="0" y="101" fill={MUTED} fontSize="11">NEW SANITY SITE</text>
        <G t={{ opacity: ev(0, 1, 5.6, 5.9) }}>
          <text x="106" y="101" fill={SEL} fontSize="11">— LIVE</text>
        </G>

        {/* Webflow lane — dims after the cutover */}
        <G t={{ opacity: [[0, 1], [5.4, 1], [5.8, 0.4], [6.5, 0.4], [6.62, 1], [D, 1]] }}>
          <rect x="0.5" y="22.5" width={N * M} height={2 * M} fill={BG} />
          <path d={mPath(0, 22, N, 2)} stroke={GRID} fill="none" />
        </G>

        {/* Sanity lane: empty slots, filled in stages */}
        <rect x="0.5" y="112.5" width={N * M} height={2 * M} stroke="#3a3a3a" strokeDasharray="2 3" fill="none" />

        <G t={{ opacity: FADE }}>
          {imports.map(([col, cols, s]) => <Import key={col} col={col} cols={cols} s={s} />)}
          {labels.map((l, i) => (
            <G key={l} t={{ opacity: show(at[i]) }}>
              {!narrow && i > 0 && <line x1={imports[i][0] * M + 0.5} y1="106" x2={imports[i][0] * M + 0.5} y2="158" stroke={GRID} />}
              <text x={narrow ? 0 : i === 0 ? 0 : imports[i][0] * M + 6} y={narrow ? 170 + i * 14 : 170} fill={MUTED} fontSize="10">{l}</text>
            </G>
          ))}

          {/* no content freeze: the team keeps editing the live Webflow site; each edit lands in Sanity too */}
          {edits.map(([col, t]) => <Edit key={col} col={col} t={t} />)}
        </G>
      </svg>
    </Ctx.Provider>
  );
}

"use client";

import { createContext, useContext, useRef } from "react";
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

/* ───────────────────────── literal kit: windows, real copy, simple shapes (founder-readable) ───────────────────────── */

const INK = "#cfcfcf";
const WIN = "#1c1c1c";
const LINE2 = "#3a3a3a";
const BLOCK_EDGE = "#3a3a3a";
const BAR = "#4f4f4f";

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

/** App window: frame + title bar. */
function Win({ x, y, w, h, title, right }: { x: number; y: number; w: number; h: number; title: string; right?: React.ReactNode }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height={h} fill={WIN} stroke={LINE2} />
      <line x1={x} y1={y + 20.5} x2={x + w} y2={y + 20.5} stroke={LINE2} />
      <Mono x={x + 10} y={y + 13.5}>{title}</Mono>
      {right}
    </>
  );
}

function Check({ x, y, s = 1, color = SEL }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x} ${y + 3 * s}l${2.2 * s} ${2.2 * s} ${4.4 * s}-${4.8 * s}`} stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

function SmallLock({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#9a9a9a" strokeWidth="0.75" fill="none">
      <rect x={x + 0.5} y={y + 2.5} width="5.5" height="4.5" />
      <path d={`M${x + 1.7} ${y + 2.5}v-0.9a1.55 1.55 0 0 1 3.1 0v0.9`} />
    </g>
  );
}

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
const Lines = ({ x, y, ws, gap = 6, h = 2.5, color = BAR }: { x: number; y: number; ws: number[]; gap?: number; h?: number; color?: string }) => (
  <>{ws.map((w, i) => <rect key={i} x={x} y={y + i * gap} width={w} height={h} fill={color} />)}</>
);
const Avatar = ({ cx, cy, r = 7 }: { cx: number; cy: number; r?: number }) => <circle cx={cx} cy={cy} r={r} stroke="#666" fill="none" />;

/* ───────────────────────── 01 · NYC Security Summit — built from the section library ───────────────────────── */

const LIBRARY = [["Hero", "Logos"], ["Features", "Stats"], ["Speakers", "Schedule"], ["Stories", "Form"]];

function SceneEvent() {
  const chipX = (c: number) => 22 + c * 72;
  const chipY = (r: number) => 38 + r * 28;
  const picks = [
    { r: 0, c: 0, s: 0.6 },
    { r: 2, c: 0, s: 1.8 },
    { r: 3, c: 0, s: 3.0 },
  ];
  const PX = 202, PW = 256;
  return (
    <G t={{ opacity: FADE }}>
      {/* the approved section library */}
      <Win x={10} y={8} w={166} h={188} title="Section library" />
      {LIBRARY.map((row, r) =>
        row.map((name, c) => {
          const p = picks.find((q) => q.r === r && q.c === c);
          return (
            <g key={name}>
              <Block x={chipX(c)} y={chipY(r)} w={64} h={18} ai={p ? aiWork(p.s, p.s + 0.8) : undefined}>
                <Mono x={chipX(c) + 8} y={chipY(r) + 12} size={6}>{name}</Mono>
                {p && (
                  <G t={{ opacity: appear(p.s + 0.2) }}>
                    <rect x={chipX(c) + 1} y={chipY(r) + 1} width="63" height="17" fill="#2a2a2a" />
                    <Mono x={chipX(c) + 8} y={chipY(r) + 12} size={6} color={SEL}>{name}</Mono>
                  </G>
                )}
              </Block>
            </g>
          );
        }),
      )}
      <G t={{ opacity: ev(1, 0, 4.4, 4.6) }}>
        <Mono x={22} y={168} size={6}>Assembling from library…</Mono>
      </G>
      <G t={{ opacity: appear(4.6) }}>
        <Check x={22} y={161} />
        <Mono x={34} y={168} size={6} color={SEL}>Draft ready</Mono>
      </G>

      {/* the new page */}
      <Win
        x={190}
        y={8}
        w={280}
        h={188}
        title="nyc-security-summit"
        right={
          <G t={{ opacity: appear(4.6) }}>
            <rect x={425.5} y={13.5} width="36" height="12" stroke="#8a8a8a" fill="none" />
            <Mono x={443.5} y={22} size={6} anchor="middle" color={SEL}>Draft</Mono>
          </G>
        }
      />
      <Block x={PX} y={32} w={PW} h={12}>
        <rect x={PX + 10} y={36.5} width="34" height="3" fill={BAR} />
        {[0, 1, 2].map((k) => <rect key={k} x={PX + PW - 78 + k * 24} y={36.5} width="16" height="3" fill={BAR} />)}
      </Block>

      {/* hero */}
      <Block x={PX} y={52} w={PW} h={44} ai={aiWork(0.9, 1.7)}>
        <G t={{ opacity: appear(1.1) }}>
          <Sans x={PX + 12} y={74} size={13}>NYC Security Summit</Sans>
          <rect x={PX + 12} y={82} width="70" height="2.5" fill={BAR} />
        </G>
      </Block>

      {/* speakers — photos as circles */}
      <Block x={PX} y={104} w={PW} h={36} ai={aiWork(2.1, 2.9)}>
        <G t={{ opacity: appear(2.3) }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <Avatar cx={PX + 30 + i * 49} cy={117} />
              <rect x={PX + 21 + i * 49} y={129} width="18" height="2.5" fill={BAR} />
            </g>
          ))}
        </G>
      </Block>

      {/* customer proof — a quote as lines */}
      <Block x={PX} y={148} w={PW} h={26} ai={aiWork(3.3, 4.1)}>
        <G t={{ opacity: appear(3.5) }}>
          <Avatar cx={PX + 20} cy={161} r={6} />
          <Lines x={PX + 34} y={156} ws={[160, 110]} gap={7} />
        </G>
      </Block>
      <Block x={PX} y={182} w={PW} h={8} />
    </G>
  );
}

/* ───────────────────────── 02 · AI Governance Report — findings first, gated download, staging ───────────────────────── */

function SceneReport() {
  const X = 24, W = 272;
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={300} h={188} title="ai-governance-report" />

      <Block x={X} y={32} w={W} h={30}>
        <Sans x={X + 12} y={51} size={11.5}>The AI Governance Report</Sans>
      </Block>

      {/* customer proof moves down, findings move to the top */}
      <G t={{ y: ev(0, 38, 1.0, 1.8) }}>
        <Block x={X} y={70} w={W} h={26}>
          <Avatar cx={X + 20} cy={83} r={6} />
          <Lines x={X + 34} y={78} ws={[150, 100]} gap={7} />
        </Block>
      </G>
      <G t={{ y: ev(0, -34, 1.0, 1.8) }}>
        <Block x={X} y={104} w={W} h={30} ai={aiWork(0.6, 1.9)}>
          {["73%", "4.2×", "12"].map((n, i) => (
            <g key={n}>
              <Sans x={X + 12 + i * 90} y={122} size={12}>{n}</Sans>
              <rect x={X + 12 + i * 90} y={127} width="34" height="2.5" fill={BAR} />
            </g>
          ))}
        </Block>
      </G>

      {/* form: work email, then download */}
      <G t={{ opacity: appear(2.2) }}>
        <Block x={X} y={142} w={W} h={26} ai={aiWork(2.2, 2.9)}>
          <rect x={X + 10.5} y={149.5} width="170" height="12" stroke="#555" fill="none" />
          <G t={{ opacity: ev(1, 0, 3.0, 3.1) }}>
            <Sans x={X + 16} y={158.5} size={7} color="#777">Work email</Sans>
          </G>
          <Typed id="rep-mail" x={X + 16} y={158.5} w={70} t0={3.1} t1={3.7} size={7}>jane@acme.com</Typed>
          <R t={{ fill: ev("#202020", "#3a3a3a", 3.8, 4.0) }} x={X + 188.5} y={149.5} width="74" height="12" stroke="#8a8a8a" />
          <Mono x={X + 225.5} y={158} size={5.5} anchor="middle" color={SEL}>Download</Mono>
        </Block>
      </G>

      {/* gated report */}
      <G t={{ opacity: [[0, 1], [2.4, 1], [2.7, 0.35], [4.0, 0.35], [4.3, 1], [D, 1]] }}>
        <Block x={X} y={176} w={W} h={12}>
          <rect x={X + 24} y={180.5} width="90" height="3" fill={BAR} />
        </Block>
      </G>
      <G t={{ opacity: [[0, 0], [2.6, 0], [2.8, 1], [4.0, 1], [4.2, 0], [D, 0]] }}>
        <SmallLock x={X + 10} y={178} />
      </G>

      {/* staging preview */}
      <G t={{ opacity: show(4.6, 0.5), x: ev(-12, 0, 4.6, 5.2) }}>
        <rect x={324.5} y={96.5} width="146" height="52" fill={WIN} stroke="#8a8a8a" />
        <Check x={336} y={107} />
        <Mono x={348} y={114} size={6.5} color={SEL}>Staging preview sent</Mono>
        <rect x={336} y={128} width="110" height="3" fill={BAR} />
      </G>
    </G>
  );
}

/* ───────────────────────── 03 · Homepage campaign — only the requested edits ───────────────────────── */

const EDITS = [
  { text: ["Replace hero headline"], at: 2.6 },
  { text: ["Move customer logos", "above the product tour"], at: 4.0 },
  { text: ["Swap in the Acme quote"], at: 5.3 },
];

function SceneHomepage() {
  const X = 22, W = 226;
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={250} h={188} title="homepage" />

      {/* protected: navigation + legal */}
      <Block x={X} y={32} w={W} h={14}>
        <rect x={X + 10} y={37.5} width="30" height="3" fill={BAR} />
        <SmallLock x={X + W - 14} y={35} />
      </Block>
      <Block x={X} y={174} w={W} h={14}>
        <rect x={X + 10} y={179.5} width="70" height="3" fill={BAR} />
        <SmallLock x={X + W - 14} y={177} />
      </Block>

      {/* hero headline replaced */}
      <Block x={X} y={56} w={W} h={30} ai={aiWork(1.2, 2.6)}>
        <G t={{ opacity: ev(1, 0, 1.6, 1.9) }}>
          <Sans x={X + 12} y={75} size={10.5}>Everything your team needs</Sans>
        </G>
        <Typed id="home-h" x={X + 12} y={75} w={170} t0={1.9} t1={2.5} size={10.5}>Security that ships with you</Typed>
      </Block>

      {/* logos move above the product tour */}
      <G t={{ y: ev(0, 22, 3.2, 4.0) }}>
        <Block x={X} y={94} w={W} h={24}>
          <rect x={X + 10.5} y={100.5} width="44" height="12" stroke="#555" fill="none" />
          <Lines x={X + 64} y={102} ws={[110, 80]} gap={6} />
        </Block>
      </G>
      <G t={{ y: ev(0, -32, 3.2, 4.0) }}>
        <Block x={X} y={126} w={W} h={14} ai={aiWork(2.9, 4.0)}>
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={X + 16 + i * 42} y={131.5} width="22" height="3" fill="#666" />)}
        </Block>
      </G>

      {/* quote swapped */}
      <Block x={X} y={148} w={W} h={20} ai={aiWork(4.5, 5.4)}>
        <G t={{ opacity: ev(1, 0, 4.7, 5.0) }}>
          <Sans x={X + 12} y={161} size={8}>“A tool our designers actually like.”</Sans>
        </G>
        <G t={{ opacity: ev(0, 1, 5.0, 5.3) }}>
          <Sans x={X + 12} y={161} size={8}>“We launch campaigns in days.” — Acme</Sans>
        </G>
      </Block>

      {/* requested edits */}
      <Win x={272} y={8} w={198} h={188} title="Requested edits" right={<G t={{ opacity: appear(5.5) }}><Mono x={460} y={21.5} anchor="end" color={SEL}>3 changes</Mono></G>} />
      {EDITS.map((e, i) => (
        <g key={i}>
          <rect x={284.5} y={40.5 + i * 32} width="10" height="10" stroke="#555" fill="none" />
          <G t={{ opacity: show(e.at, 0.3) }}>
            <Check x={286.5} y={42.5 + i * 32} s={0.8} />
          </G>
          {e.text.map((l, j) => <Sans key={j} x={304} y={48.5 + i * 32 + j * 11} size={8.5}>{l}</Sans>)}
        </g>
      ))}
      <rect x={284.5} y={136.5} width="10" height="10" stroke="#555" fill="none" />
      <SmallLock x={286.5} y={138} />
      <Sans x={304} y={144.5} size={8.5} color="#888">Navigation and legal</Sans>
      <Sans x={304} y={155.5} size={8.5} color="#888">stay unchanged</Sans>
    </G>
  );
}

/* ───────────────────────── 04 · Event conversion — a 50/50 PostHog test ───────────────────────── */

function Variant({ x, b }: { x: number; b?: boolean }) {
  const y = 34, w = 212;
  return (
    <>
      <Block x={x} y={y} w={w} h={134}>
        <Mono x={x + 12} y={y + 15} size={7} color={b ? SEL : MUTED}>{b ? "B" : "A"}</Mono>
        <Mono x={x + w - 12} y={y + 15} size={6.5} anchor="end">50%</Mono>
        <line x1={x} y1={y + 22.5} x2={x + w} y2={y + 22.5} stroke="#333" />
      </Block>
      {/* headline */}
      <Block x={x + 10} y={y + 32} w={w - 20} h={44} ai={b ? aiWork(1.0, 2.0) : undefined}>
        {b ? (
          <>
            <G t={{ opacity: ev(1, 0, 1.2, 1.4) }}>
              <Sans x={x + 22} y={y + 52} size={11}>Join us in New York</Sans>
            </G>
            <Typed id="ab-h" x={x + 22} y={y + 52} w={150} t0={1.4} t1={1.9} size={11}>Save your seat in NYC</Typed>
          </>
        ) : (
          <Sans x={x + 22} y={y + 52} size={11}>Join us in New York</Sans>
        )}
        {/* CTA */}
        {b ? (
          <>
            <R t={{ width: ev(56, 84, 2.1, 2.6) }} x={x + 22.5} y={y + 59.5} height="11" stroke="#8a8a8a" fill="none" />
            <G t={{ opacity: ev(1, 0, 2.1, 2.3) }}>
              <Mono x={x + 28} y={y + 67} size={5.5}>Register</Mono>
            </G>
            <G t={{ opacity: ev(0, 1, 2.4, 2.6) }}>
              <Mono x={x + 28} y={y + 67} size={5.5} color={SEL}>Reserve my spot</Mono>
            </G>
          </>
        ) : (
          <>
            <rect x={x + 22.5} y={y + 59.5} width="56" height="11" stroke="#555" fill="none" />
            <Mono x={x + 28} y={y + 67} size={5.5}>Register</Mono>
          </>
        )}
      </Block>
      {/* result */}
      <Mono x={x + 12} y={y + 96} size={6}>Registrations</Mono>
      <Count x={x + 12} y={y + 118} t0={3.0} t1={5.4} values={b ? ["0", "9", "21", "34", "46", "57"] : ["0", "7", "15", "22", "31", "38"]} size={15} color={b ? SEL : INK} />
      <G t={{ opacity: appear(5.5) }}>
        <Mono x={x + w - 12} y={y + 118} size={7} anchor="end" color={b ? SEL : MUTED}>{b ? "4.4%" : "2.9%"}</Mono>
      </G>
    </>
  );
}

function SceneAB() {
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={460} h={188} title="PostHog experiment" right={<Mono x={460} y={21.5} anchor="end">Goal · registrations</Mono>} />
      <Variant x={22} />
      <Variant x={246} b />
      <G t={{ opacity: ev(1, 0, 5.4, 5.6) }}>
        <Mono x={22} y={186} size={6}>Collecting registrations…</Mono>
      </G>
      <G t={{ opacity: appear(5.6) }}>
        <Mono x={22} y={186} size={6} color={SEL}>B leading · +52%</Mono>
      </G>
    </G>
  );
}

const SCENES = [SceneEvent, SceneReport, SceneHomepage, SceneAB];

export function RequestScene({ index, active }: { index: number; active: boolean }) {
  const reduce = !!useReducedMotion();
  const Scene = SCENES[index];
  return (
    <Ctx.Provider value={{ on: active && !reduce, reduce }}>
      <svg aria-hidden viewBox="0 0 480 204" fill="none" className="block h-auto w-full overflow-visible">
        <Scene />
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



export function MigrationLanes() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const reduce = !!useReducedMotion();
  const on = inView && !reduce;
  return (
    <Ctx.Provider value={{ on, reduce }}>
      <svg aria-hidden ref={ref} viewBox="0 0 620 196" fill="none" className="block h-auto w-full overflow-visible" style={{ fontFamily: "var(--font-mono)" }}>
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
          <rect x="0.5" y="22.5" width={30 * M} height={2 * M} fill={BG} />
          <path d={mPath(0, 22, 30, 2)} stroke={GRID} fill="none" />
        </G>

        {/* Sanity lane: empty slots, filled in stages */}
        <rect x="0.5" y="112.5" width={30 * M} height={2 * M} stroke="#3a3a3a" strokeDasharray="2 3" fill="none" />

        <G t={{ opacity: FADE }}>
          <Import col={0} cols={10} s={0.4} />
          <Import col={10} cols={8} s={1.5} />
          <Import col={18} cols={12} s={4.0} />
          <G t={{ opacity: show(1.6) }}>
            <text x="0" y="170" fill={MUTED} fontSize="10">IMPORT 01 · 640 PAGES</text>
          </G>
          <G t={{ opacity: show(2.7) }}>
            <line x1="200.5" y1="106" x2="200.5" y2="158" stroke={GRID} />
            <text x="206" y="170" fill={MUTED} fontSize="10">IMPORT 02 · 410 PAGES</text>
          </G>
          <G t={{ opacity: show(5.2) }}>
            <line x1="360.5" y1="106" x2="360.5" y2="158" stroke={GRID} />
            <text x="366" y="170" fill={MUTED} fontSize="10">IMPORT 03 · 950 PAGES</text>
          </G>

          {/* content changes on the live site (a person edits) → re-imported, no freeze */}
          {/* a person edits one piece of content on the live site (cursor = a person, as in the hero) */}
          <G t={{ opacity: [[0, 0], [2.65, 0], [2.7, 1], [4.2, 1], [4.5, 0], [D, 0]] }}>
            <rect x={4 * M + 0.5} y={22.5} width={M} height={M} stroke={SEL} fill={BG} />
            <rect x={4 * M + 6} y={28} width="9" height="2" fill={SEL} />
            <rect x={4 * M + 6} y={33} width="6" height="2" fill={SEL} />
          </G>
          <G
            t={{
              x: [[0, 190], [1.9, 190], [2.55, 94], [3.1, 94], [3.5, 130], [D, 130]],
              y: [[0, 70], [1.9, 70], [2.55, 34], [3.1, 34], [3.5, 60], [D, 60]],
              opacity: [[0, 0], [1.9, 0], [2.05, 1], [3.2, 1], [3.5, 0], [D, 0]],
              scale: [[0, 1], [2.55, 1], [2.62, 0.82], [2.72, 1], [D, 1]],
            }}
          >
            <path d="M0 0L13 7.8L7 9L4.2 14.8Z" fill={SEL} stroke={BG} strokeWidth="1" strokeLinejoin="round" />
          </G>
          <G t={{ opacity: pulse(3.3, 4.2) }}>
            <line x1={4.5 * M + 0.5} y1="64" x2={4.5 * M + 0.5} y2="110" stroke={MUTED} strokeDasharray="2 3" />
          </G>
          <G t={{ y: ev(0, 90, 3.4, 4.0), opacity: [[0, 0], [3.3, 0], [3.4, 1], [4.2, 1], [4.5, 0], [D, 0]] }}>
            <rect x={4 * M + 0.5} y={22.5} width={M} height={M} fill={BG} stroke={SEL} strokeDasharray="3 2" />
          </G>
          <G t={{ opacity: show(4.0) }}>
            <rect x={4 * M + 0.5} y={112.5} width={M} height={M} stroke={SEL} fill="none" />
          </G>
          <G t={{ opacity: pulse(3.4, 5.2) }}>
            <text x={4 * M + 26} y="86" fill={SEL} fontSize="10">RE-IMPORT · 1 PAGE</text>
          </G>
        </G>
      </svg>
    </Ctx.Provider>
  );
}

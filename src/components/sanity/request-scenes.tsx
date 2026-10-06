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
const NODE_FILL = "#2a2a2a";
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
  return <rect x={x - 2} y={y - 2} width="5" height="5" fill={NODE_FILL} stroke={SEL} strokeWidth="0.75" />;
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g stroke={SEL} strokeWidth="0.75" fill="none">
      <rect x={x + 0.5} y={y + 3.5} width="7" height="5.5" />
      <path d={`M${x + 2} ${y + 3.5}v-1.2a2 2 0 0 1 4 0v1.2`} />
    </g>
  );
}

/** Whole-scene fade that hides the reset between loops. */
const FADE: Track = [[0, 1], [6.25, 1], [6.5, 0], [6.75, 0], [D, 1]];

/* ───────────────────────── literal kit: windows, labels, real copy (founder-readable) ───────────────────────── */

const INK = "#cfcfcf";
const WIN = "#1c1c1c";
const LINE2 = "#3a3a3a";

function Mono({ x, y, children, color = MUTED, size = 7.5, anchor }: { x: number; y: number; children: string; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
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

/** App window: frame + title bar with a mono title and an optional right-hand label. */
function Win({ x, y, w, h, title, right }: { x: number; y: number; w: number; h: number; title: string; right?: React.ReactNode }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height={h} fill={WIN} stroke={LINE2} />
      <line x1={x} y1={y + 18.5} x2={x + w} y2={y + 18.5} stroke={LINE2} />
      <Mono x={x + 9} y={y + 12.5}>{title}</Mono>
      {right}
    </>
  );
}

/** Outline box with corner nodes — dashed while AI works on it, solid for a person / approved. */
function BoxEdge({ x, y, w, h, t, dashed, color = SEL }: { x: number; y: number; w: number; h: number; t: Track; dashed?: boolean; color?: string }) {
  const x0 = x + 0.5, y0 = y + 0.5;
  return (
    <G t={{ opacity: t }}>
      <rect x={x0} y={y0} width={w} height={h} stroke={color} strokeDasharray={dashed ? "4 3" : undefined} fill="none" />
      {[[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]].map(([a, b], i) => <Node key={i} x={a} y={b} />)}
    </G>
  );
}

/** A section on a page: frame + small mono name. */
function Section({ x, y, w, h, name, children, stroke = "#333" }: { x: number; y: number; w: number; h: number; name?: string; children?: React.ReactNode; stroke?: string }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height={h} fill="#202020" stroke={stroke} />
      {name && <Mono x={x + 5} y={y + 9} size={5.5} color="#777">{name}</Mono>}
      {children}
    </>
  );
}

function Check({ x, y, color = SEL }: { x: number; y: number; color?: string }) {
  return <path d={`M${x} ${y + 3.5}l2.6 2.6 5.2-5.6`} stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
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

/** A number that counts up: shows each value in turn between t0 and t1. */
function Count({ x, y, values, t0, t1, size = 14, color = INK, anchor }: { x: number; y: number; values: string[]; t0: number; t1: number; size?: number; color?: string; anchor?: "start" | "middle" | "end" }) {
  const step = (t1 - t0) / (values.length - 1);
  return (
    <>
      {values.map((v, i) => {
        const a = t0 + i * step, b = a + step;
        const last = i === values.length - 1;
        const t: Track = i === 0
          ? [[0, 1], [a + step - 0.02, 1], [b, 0], [6.6, 0], [6.62, 1], [D, 1]]
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

/* ───────────────────────── 01 · NYC Security Summit — built from the section library ───────────────────────── */

const LIBRARY = [["Hero", "Logos"], ["Features", "Stats"], ["Speakers", "Schedule"], ["Stories", "Form"]];

function SceneEvent() {
  const picks: { chip: [number, number]; s: number }[] = [
    { chip: [0, 0], s: 0.6 },
    { chip: [2, 0], s: 1.8 },
    { chip: [3, 0], s: 3.0 },
  ];
  const chipX = (c: number) => 20 + c * 79;
  const chipY = (r: number) => 34 + r * 24;
  const PX = 208, PW = 252;
  return (
    <G t={{ opacity: FADE }}>
      {/* section library */}
      <Win x={10} y={8} w={170} h={188} title="Section library" />
      {LIBRARY.map((row, r) =>
        row.map((name, c) => (
          <g key={name}>
            <rect x={chipX(c) + 0.5} y={chipY(r) + 0.5} width="72" height="17" fill="#202020" stroke="#383838" />
            <Mono x={chipX(c) + 7} y={chipY(r) + 11.5} size={6.5}>{name}</Mono>
          </g>
        )),
      )}
      {picks.map((p, i) => (
        <g key={i}>
          <BoxEdge x={chipX(p.chip[1])} y={chipY(p.chip[0])} w={72} h={17} dashed t={pulse(p.s, p.s + 0.9)} />
          <G t={{ opacity: show(p.s + 0.2) }}>
            <rect x={chipX(p.chip[1]) + 0.5} y={chipY(p.chip[0]) + 0.5} width="72" height="17" fill="none" stroke={CHANGED_EDGE} />
            <Mono x={chipX(p.chip[1]) + 7} y={chipY(p.chip[0]) + 11.5} size={6.5} color={SEL}>{LIBRARY[p.chip[0]][p.chip[1]]}</Mono>
          </G>
        </g>
      ))}
      <G t={{ opacity: ev(1, 0, 4.5, 4.7) }}>
        <Mono x={20} y={146} size={6.5}>Assembling from library…</Mono>
      </G>
      <G t={{ opacity: show(4.7) }}>
        <Check x={20} y={140} />
        <Mono x={32} y={146} size={6.5} color={SEL}>Draft ready</Mono>
      </G>

      {/* the new page */}
      <Win
        x={196}
        y={8}
        w={274}
        h={188}
        title="NYC Security Summit"
        right={
          <G t={{ opacity: show(4.7) }}>
            <rect x={428.5} y={12.5} width="34" height="11" stroke={CHANGED_EDGE} fill="none" />
            <Mono x={445} y={20.5} size={6} anchor="middle" color={SEL}>Draft</Mono>
          </G>
        }
      />
      <Section x={PX} y={32} w={PW} h={10}>
        <Mono x={PX + 5} y={39.5} size={5.5}>Summit / NYC</Mono>
      </Section>

      {/* hero */}
      <BoxEdge x={PX} y={48} w={PW} h={44} dashed t={pulse(0.9, 1.6)} />
      <G t={{ opacity: show(1.1) }}>
        <Section x={PX} y={48} w={PW} h={44}>
          <Mono x={PX + 8} y={60} size={5.5}>Enterprise security summit</Mono>
          <Sans x={PX + 8} y={76} size={13}>NYC Security Summit</Sans>
          <rect x={PX + 8} y={82} width="60" height="2" fill="#555" />
        </Section>
      </G>

      {/* speakers */}
      <BoxEdge x={PX} y={98} w={PW} h={40} dashed t={pulse(2.1, 2.8)} />
      <G t={{ opacity: show(2.3) }}>
        <Section x={PX} y={98} w={PW} h={40} name="This year's speakers">
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={PX + 8 + i * 60 + 0.5} y={110.5} width="16" height="16" stroke="#555" fill="none" />
              <rect x={PX + 28 + i * 60} y={115} width="26" height="2" fill="#555" />
              <rect x={PX + 28 + i * 60} y={120} width="18" height="2" fill="#444" />
            </g>
          ))}
        </Section>
      </G>

      {/* customer proof */}
      <BoxEdge x={PX} y={144} w={PW} h={30} dashed t={pulse(3.3, 4.0)} />
      <G t={{ opacity: show(3.5) }}>
        <Section x={PX} y={144} w={PW} h={30}>
          <Sans x={PX + 8} y={158} size={8.5}>“Our strongest rollout, with zero surprises.”</Sans>
          <Mono x={PX + 8} y={168} size={5.5}>CISO, Acme</Mono>
        </Section>
      </G>

      <G t={{ opacity: show(4.2) }}>
        <Section x={PX} y={180} w={PW} h={10} />
      </G>

    </G>
  );
}

/* ───────────────────────── 02 · AI Governance Report — findings first, gated download, staging ───────────────────────── */

function SceneReport() {
  const X = 20, W = 280;
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={300} h={188} title="AI governance report" right={<Mono x={302} y={20.5} anchor="end">Landing page</Mono>} />

      <Section x={X} y={30} w={W} h={34}>
        <Mono x={X + 8} y={42} size={5.5}>New research</Mono>
        <Sans x={X + 8} y={56} size={12}>The AI Governance Report</Sans>
      </Section>

      {/* customer proof moves down, findings move to the top */}
      <G t={{ y: ev(0, 38, 1.0, 1.8) }}>
        <Section x={X} y={70} w={W} h={30}>
          <Sans x={X + 8} y={84} size={8.5}>“Our board finally trusts our AI roadmap.”</Sans>
          <Mono x={X + 8} y={94} size={5.5}>VP Engineering, Acme</Mono>
        </Section>
      </G>
      <G t={{ y: ev(0, -38, 1.0, 1.8) }}>
        <Section x={X} y={108} w={W} h={32} name="Key findings">
          {[["73%", "of teams lack AI policy"], ["4.2×", "faster approvals"], ["12", "controls that matter"]].map(([n, l], i) => (
            <g key={n}>
              <Sans x={X + 8 + i * 92} y={129} size={12}>{n}</Sans>
              <Mono x={X + 8 + i * 92} y={136} size={5}>{l}</Mono>
            </g>
          ))}
        </Section>
        <BoxEdge x={X} y={108} w={W} h={32} dashed t={pulse(0.6, 1.9)} />
      </G>

      {/* form: work email before download */}
      <G t={{ opacity: show(2.2) }}>
        <Section x={X} y={146} w={W} h={24} name="Download the report">
          <rect x={X + 8.5} y={155.5} width="170" height="11" stroke="#555" fill="none" />
          <G t={{ opacity: ev(1, 0, 2.9, 3.0) }}>
            <Sans x={X + 13} y={163.5} size={7} color="#777">Work email</Sans>
          </G>
          <Typed id="rep-mail" x={X + 13} y={163.5} w={70} t0={3.0} t1={3.6} size={7}>jane@acme.com</Typed>
          <R t={{ fill: ev("#202020", "#3a3a3a", 3.8, 4.0) }} x={X + 186.5} y={155.5} width="86" height="11" stroke={CHANGED_EDGE} />
          <Mono x={X + 229} y={163} size={5.5} anchor="middle" color={SEL}>Download</Mono>
        </Section>
      </G>
      <BoxEdge x={X} y={146} w={W} h={24} dashed t={pulse(2.0, 2.8)} />

      {/* gated report */}
      <G t={{ opacity: [[0, 1], [2.4, 1], [2.7, 0.35], [4.0, 0.35], [4.3, 1], [D, 1]] }}>
        <Section x={X} y={176} w={W} h={14}>
          <Mono x={X + 8} y={185.5} size={5.5}>Full report · PDF · 48 pages</Mono>
        </Section>
      </G>
      <G t={{ opacity: [[0, 0], [2.6, 0], [2.8, 1], [4.0, 1], [4.2, 0], [D, 0]] }}>
        <Lock x={X + W - 16} y={178} />
      </G>

      {/* staging preview */}
      <G t={{ opacity: show(4.6, 0.5), x: ev(-12, 0, 4.6, 5.2) }}>
        <rect x={322.5} y={96.5} width="148" height="58" fill={WIN} stroke={CHANGED_EDGE} />
        <Check x={332} y={106} />
        <Mono x={345} y={113} size={6.5} color={SEL}>Staging preview sent</Mono>
        <Mono x={332} y={130} size={5.5}>staging.acme.com/</Mono>
        <Mono x={332} y={140} size={5.5}>ai-governance-report</Mono>
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
  const X = 20, W = 230;
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={250} h={188} title="Homepage" right={<Mono x={252} y={20.5} anchor="end">Draft</Mono>} />

      {/* protected */}
      <Section x={X} y={28} w={W} h={12}>
        <Mono x={X + 5} y={36.5} size={5.5}>Navigation</Mono>
        <Lock x={X + W - 13} y={29} />
      </Section>
      <Section x={X} y={178} w={W} h={12}>
        <Mono x={X + 5} y={186.5} size={5.5}>Legal</Mono>
        <Lock x={X + W - 13} y={179} />
      </Section>

      {/* hero headline replaced */}
      <Section x={X} y={46} w={W} h={34}>
        <Mono x={X + 8} y={57} size={5.5}>Hero</Mono>
        <G t={{ opacity: ev(1, 0, 1.6, 1.9) }}>
          <Sans x={X + 8} y={72} size={11}>Everything your team needs</Sans>
        </G>
        <Typed id="home-h" x={X + 8} y={72} w={170} t0={1.9} t1={2.5} size={11}>Security that ships with you</Typed>
      </Section>
      <BoxEdge x={X} y={46} w={W} h={34} dashed t={pulse(1.2, 2.6)} />

      {/* logos move above the product tour */}
      <G t={{ y: ev(0, 20, 3.2, 4.0) }}>
        <Section x={X} y={86} w={W} h={26} name="Product tour">
          <rect x={X + 8} y={99} width="120" height="2" fill="#555" />
          <rect x={X + 8} y={104} width="90" height="2" fill="#444" />
        </Section>
      </G>
      <G t={{ y: ev(0, -32, 3.2, 4.0) }}>
        <Section x={X} y={118} w={W} h={14}>
          <Mono x={X + 5} y={127} size={5.5}>Customer logos</Mono>
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={X + 84 + i * 28} y={123} width="18" height="4" fill="#555" />)}
        </Section>
        <BoxEdge x={X} y={118} w={W} h={14} dashed t={pulse(2.9, 4.0)} />
      </G>

      {/* quote swapped */}
      <Section x={X} y={138} w={W} h={34}>
        <G t={{ opacity: ev(1, 0, 4.7, 5.0) }}>
          <Sans x={X + 8} y={154} size={8.5}>“A tool our designers actually like.”</Sans>
          <Mono x={X + 8} y={164} size={5.5}>Northwind</Mono>
        </G>
        <G t={{ opacity: ev(0, 1, 5.0, 5.3) }}>
          <Sans x={X + 8} y={154} size={8.5}>“We launch campaigns in days, not weeks.”</Sans>
          <Mono x={X + 8} y={164} size={5.5} color={SEL}>Acme</Mono>
        </G>
      </Section>
      <BoxEdge x={X} y={138} w={W} h={34} dashed t={pulse(4.5, 5.4)} />

      {/* requested edits */}
      <Win x={272} y={8} w={198} h={188} title="Requested edits" right={<G t={{ opacity: show(5.5) }}><Mono x={462} y={20.5} anchor="end" color={SEL}>3 changes · updated</Mono></G>} />
      {EDITS.map((e, i) => (
        <g key={i}>
          <rect x={282.5} y={36.5 + i * 32} width="11" height="11" stroke="#555" fill="none" />
          <G t={{ opacity: show(e.at, 0.3) }}>
            <Check x={284} y={38 + i * 32} />
          </G>
          {e.text.map((l, j) => <Sans key={j} x={301} y={45 + i * 32 + j * 11} size={8.5}>{l}</Sans>)}
        </g>
      ))}
      <rect x={282.5} y={132.5} width="11" height="11" stroke="#555" fill="none" />
      <Lock x={284} y={133} />
      <Sans x={301} y={141} size={8.5} color="#888">Navigation and legal copy</Sans>
      <Sans x={301} y={152} size={8.5} color="#888">stay unchanged</Sans>
    </G>
  );
}

/* ───────────────────────── 04 · Event conversion — a 50/50 PostHog test ───────────────────────── */

function Variant({ x, label, b }: { x: number; label: string; b?: boolean }) {
  const y = 46, w = 210;
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height="124" fill="#202020" stroke={b ? CHANGED_EDGE : "#383838"} />
      <Mono x={x + 8} y={y + 12} size={6.5} color={b ? SEL : MUTED}>{label}</Mono>
      <Mono x={x + w - 8} y={y + 12} size={6.5} anchor="end">50%</Mono>
      <line x1={x} y1={y + 18.5} x2={x + w} y2={y + 18.5} stroke="#333" />
      {/* the mini event page */}
      <Mono x={x + 10} y={y + 32} size={5}>Summit / NYC</Mono>
      {b ? (
        <>
          <G t={{ opacity: ev(1, 0, 1.2, 1.4) }}>
            <Sans x={x + 10} y={y + 50} size={12}>Join us in New York</Sans>
          </G>
          <Typed id="ab-h" x={x + 10} y={y + 50} w={150} t0={1.4} t1={1.9} size={12}>Save your seat in NYC</Typed>
          <BoxEdge x={x + 6} y={y + 36} w={170} h={20} dashed t={pulse(1.0, 2.0)} />
        </>
      ) : (
        <Sans x={x + 10} y={y + 50} size={12}>Join us in New York</Sans>
      )}
      <rect x={x + 10} y={y + 58} width="120" height="2" fill="#444" />
      {b ? (
        <>
          <R t={{ width: ev(52, 78, 2.1, 2.6) }} x={x + 10.5} y={y + 66.5} height="13" stroke={CHANGED_EDGE} fill="none" />
          <G t={{ opacity: ev(1, 0, 2.1, 2.3) }}>
            <Mono x={x + 16} y={y + 75.5} size={5.5}>Register</Mono>
          </G>
          <G t={{ opacity: ev(0, 1, 2.4, 2.6) }}>
            <Mono x={x + 16} y={y + 75.5} size={5.5} color={SEL}>Reserve my spot</Mono>
          </G>
          <BoxEdge x={x + 6} y={y + 62} w={88} h={21} dashed t={pulse(2.0, 2.8)} />
        </>
      ) : (
        <>
          <rect x={x + 10.5} y={y + 66.5} width="52" height="13" stroke="#555" fill="none" />
          <Mono x={x + 16} y={y + 75.5} size={5.5}>Register</Mono>
        </>
      )}
      {/* result */}
      <line x1={x + 10} y1={y + 92.5} x2={x + w - 10} y2={y + 92.5} stroke="#333" />
      <Mono x={x + 10} y={y + 104} size={5.5}>Registrations</Mono>
      <Count x={x + 10} y={y + 118} t0={3.0} t1={5.4} values={b ? ["0", "9", "21", "34", "46", "57"] : ["0", "7", "15", "22", "31", "38"]} size={12} color={b ? SEL : INK} />
      <G t={{ opacity: show(5.5) }}>
        <Mono x={x + w - 10} y={y + 118} size={7} anchor="end" color={b ? SEL : MUTED}>{b ? "4.4% conv." : "2.9% conv."}</Mono>
      </G>
    </>
  );
}

function SceneAB() {
  return (
    <G t={{ opacity: FADE }}>
      <Win x={10} y={8} w={460} h={188} title="PostHog experiment" right={<Mono x={462} y={20.5} anchor="end">50 / 50 split</Mono>} />
      <Mono x={22} y={37} size={6}>Goal</Mono>
      <Sans x={48} y={37.5} size={8.5}>Completed registrations</Sans>
      <Variant x={22} label="Variant A · current" />
      <Variant x={248} label="Variant B · new" b />
      <circle cx={25} cy={183} r="2.5" fill={MUTED} />
      <G t={{ opacity: ev(1, 0, 5.4, 5.6) }}>
        <Mono x={32} y={185.5} size={6}>Collecting views and registrations</Mono>
      </G>
      <G t={{ opacity: show(5.6) }}>
        <Mono x={32} y={185.5} size={6} color={SEL}>Variant B leading · +52%</Mono>
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
          <text x="86" y="11" fill={MUTED} fontSize="11">— LIVE, STILL EDITED</text>
        </G>
        <text x="0" y="101" fill={MUTED} fontSize="11">NEW SANITY SITE</text>
        <G t={{ opacity: ev(0, 1, 5.6, 5.9) }}>
          <text x="106" y="101" fill={SEL} fontSize="11">— LIVE AFTER THE SWITCH</text>
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
            <text x={4 * M + 26} y="86" fill={SEL} fontSize="10">EDITED ON WEBFLOW → RE-IMPORTED</text>
          </G>
        </G>
      </svg>
    </Ctx.Provider>
  );
}

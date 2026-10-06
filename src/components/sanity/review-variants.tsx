"use client";

import { useEffect, useState } from "react";
import {
  ab, BG, C, CARD_W4, CARDS4, cellsPath, Cursor, EDGE, EdgeBox, G, GRID, Header, HI, MID, PanelCtx, R, SOFT, type Track, useDur,
} from "./product-fragments";

/**
 * Three directions for hero panel 03 (Review). Same story in each — a person rewrites the
 * headline, changes the order of something, then switches the page live — told in a different
 * visual language. Same page as panel 02: hero, logo row, four cards, CTA.
 */

const BAR = "#5a5a5a";
const leftGrow = { transformBox: "fill-box" as const, originX: 0, originY: 0.5 };
const CARD_Y = 132;
const SLOT_STEP = CARDS4[1] - CARDS4[0];

/* ── shared pieces ── */

/** Draft → live switch in the header; flips at t. */
function SwitchHeader({ t }: { t: number }) {
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
function GoLive({ id, t, boxes }: { id: string; t: number; boxes: [number, number, number, number][] }) {
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

function Person({ t }: { t: Record<string, Track> }) {
  return (
    <G t={t}>
      <Cursor />
    </G>
  );
}

/** Card row where card 4 is dragged to the front and the others make room. */
function useCardMoves(t0: number, t1: number) {
  const d = useDur();
  return CARDS4.map((x, i) => (i === 3 ? ab(0, CARDS4[0] - x, t0, t1, d) : ab(0, SLOT_STEP, t0, t1, d)));
}

/* ── A · TEXT: real-looking copy, one tone, hierarchy by weight ── */

export function ReviewText() {
  const d = useDur();
  const moves = useCardMoves(3.0, 3.8);
  const block = { fill: "#232323", stroke: "#333" };
  return (
    <>
      <SwitchHeader t={4.9} />

      {/* hero: two-line headline is rewritten, three-line paragraph stays */}
      <rect x="40.5" y="48.5" width="240" height="50" {...block} />
      <R t={{ scaleX: [[0, 1], [1.3, 1], [1.45, 0], [1.85, 0.8], [d, 0.8]] }} linear={["scaleX"]} x={50} y={56} width={160} height={6} fill={BAR} style={leftGrow} />
      <R t={{ scaleX: [[0, 1], [1.3, 1], [1.45, 0], [1.85, 0], [2.15, 1.3], [d, 1.3]] }} linear={["scaleX"]} x={50} y={66} width={84} height={6} fill={BAR} style={leftGrow} />
      {[170, 160, 112].map((w, j) => <rect key={j} x="50" y={79 + j * 5} width={w} height="2" fill={BAR} />)}
      <G t={{ opacity: [[0, 0], [1.15, 0], [1.25, 1], [2.3, 1], [2.5, 0], [d, 0]] }}>
        <EdgeBox x={46} y={52} w={172} h={24} />
      </G>

      {/* logo row */}
      <rect x="40.5" y="110.5" width="240" height="10" {...block} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={52 + i * 46} y="114" width="26" height="3" fill={BAR} />)}

      {/* cards: the fourth is dragged to the front */}
      {CARDS4.map((x, i) => (
        <G key={i} t={{ x: moves[i] }}>
          <rect x={x + 0.5} y={CARD_Y + 0.5} width={CARD_W4} height="40" {...block} />
          <rect x={x + 6} y={CARD_Y + 8} width="28" height="4" fill={BAR} />
          {[36, 32, 24].map((w, j) => <rect key={j} x={x + 6} y={CARD_Y + 17 + j * 5} width={w} height="2" fill={BAR} />)}
          {i === 3 && (
            <G t={{ opacity: [[0, 0], [2.85, 0], [2.95, 1], [3.9, 1], [4.1, 0], [d, 0]] }}>
              <EdgeBox x={x} y={CARD_Y} w={CARD_W4} h={40} />
            </G>
          )}
        </G>
      ))}

      {/* cta */}
      <rect x="40.5" y="184.5" width="240" height="30" {...block} />
      <rect x="50" y="192" width="110" height="5" fill={BAR} />
      <rect x="50" y="202" width="80" height="2" fill={BAR} />
      <rect x="232.5" y="192.5" width="38" height="13" stroke={BAR} fill="none" />

      <GoLive id="a" t={5.3} boxes={[[40, 48, 240, 50], [40, 110, 240, 10], ...CARDS4.map((x): [number, number, number, number] => [x, CARD_Y, CARD_W4, 40]), [40, 184, 240, 30]]} />

      <Person
        t={{
          x: [[0, 300], [0.4, 300], [1.1, 120], [2.3, 120], [2.85, 255], [3.0, 255], [3.8, 65], [4.0, 65], [4.8, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.1, 60], [2.3, 60], [2.85, 150], [4.0, 150], [4.8, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [5.5, 1], [5.9, 0], [d, 0]],
          scale: [[0, 1], [1.1, 1], [1.17, 0.82], [1.27, 1], [2.85, 1], [2.92, 0.85], [3.8, 0.85], [3.9, 1], [4.8, 1], [4.87, 0.82], [4.97, 1], [d, 1]],
        }}
      />
    </>
  );
}

/* ── B · GRID: the page stays in squares, like panel 02 and Vibe Fixer ── */

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const HERO_NOISE = (() => {
  const r = rng(5);
  const out: { k: number; row: number; fill: string; t: Track }[] = [];
  for (let row = 0; row < 5; row++)
    for (let k = 0; k < 24; k++) {
      const g = Math.round(48 + r() * 110);
      const peak = 0.3 + r() * 0.6;
      const a = 1.35 + r() * 0.2, b = 2.1 + (k / 24) * 0.35 + r() * 0.1;
      out.push({ k, row, fill: `rgb(${g},${g},${g})`, t: [[0, 0], [a, 0], [a + 0.15, peak], [a + 0.45, peak * 0.4], [b, peak * 0.7], [b + 0.2, 0], [7.2, 0]] });
    }
  return out;
})();

export function ReviewGrid() {
  const d = useDur();
  return (
    <>
      <SwitchHeader t={4.9} />

      {/* hero: rewritten — data noise, then the new cells settle */}
      <path d={cellsPath(40, 48, 24, 5)} stroke={GRID} fill="none" />
      {HERO_NOISE.map((n, i) => (
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

/* ── player: loops one variant in a hero-sized panel ── */

export function VariantPlayer({ Panel, dur }: { Panel: () => React.ReactNode; dur: number }) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setCycle((c) => c + 1), (dur + 1.2) * 1000);
    return () => clearTimeout(t);
  }, [cycle, dur]);
  return (
    <div className="relative aspect-[4/3] w-full border border-[#4a4a4a] bg-[#1c1c1c]">
      <PanelCtx.Provider value={{ mode: "play", dur }}>
        <svg key={cycle} aria-hidden viewBox="0 0 320 240" fill="none" className="absolute inset-0 h-full w-full">
          <Panel />
        </svg>
      </PanelCtx.Provider>
    </div>
  );
}

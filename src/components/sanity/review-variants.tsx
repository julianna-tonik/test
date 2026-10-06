"use client";

import { useEffect, useState } from "react";
import {
  ab, BAR, BG, C, CARD_W4, CARDS4, cellsPath, EDGE, EdgeBox, G, GoLive, heroNoise, leftGrow, PanelCtx, Person, R, SwitchHeader, useCardMoves, useDur,
} from "./product-fragments";

export { ReviewApprove, ReviewGrid } from "./product-fragments";

const HERO_NOISE_D = heroNoise(7.6);

/**
 * Three directions for hero panel 03 (Review). Same story in each — a person rewrites the
 * headline, changes the order of something, then switches the page live — told in a different
 * visual language. Same page as panel 02: hero, logo row, four cards, CTA.
 */

const CARD_Y = 132;

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

/* ── D · GRID + APPROVE: squares like B, AI's blocks dashed like C, a person makes them solid ── */

/**
 * A grid block drafted by AI — the whole grid is dashed, so nothing solid sits underneath —
 * which a person approves at `at`: the grid turns solid and lifts a step, the edge goes light.
 */
function MixBlock({ x, y, cols, rows, at, flash }: { x: number; y: number; cols: number; rows: number; at: number; flash?: [number, number] }) {
  const d = useDur();
  const w = cols * C, h = rows * C;
  const grid = cellsPath(x, y, cols, rows);
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={w} height={h} fill={BG} />
      <G t={{ opacity: ab(1, 0, at, at + 0.3, d) }}>
        <path d={grid} stroke="#6a6a6a" strokeDasharray="2 2" fill="none" />
      </G>
      <G t={{ opacity: ab(0, 1, at, at + 0.3, d) }}>
        <path d={grid} stroke="#555" fill="none" />
        <rect x={x + 0.5} y={y + 0.5} width={w} height={h} stroke={EDGE} fill="none" />
      </G>
      {flash && (
        <G t={{ opacity: [[0, 0], [flash[0] - 0.05, 0], [flash[0] + 0.05, 1], [flash[1], 1], [flash[1] + 0.2, 0], [d, 0]] }}>
          <EdgeBox x={x} y={y} w={w} h={h} />
        </G>
      )}
    </>
  );
}

export function ReviewMix() {
  const d = useDur();
  const CARDS_AT = 4.3;
  return (
    <>
      <SwitchHeader t={5.7} />

      {/* hero: the person rewrites it (noise settles), then it is approved */}
      <MixBlock x={40} y={48} cols={24} rows={5} at={2.5} flash={[1.15, 2.6]} />
      {HERO_NOISE_D.map((n, i) => (
        <R key={i} t={{ opacity: n.t }} x={40 + n.k * C + 1} y={48 + n.row * C + 1} width={C - 1} height={C - 1} fill={n.fill} />
      ))}

      {/* cards move up as the logo row is dragged below them; approved together */}
      <G t={{ y: ab(0, -22, 2.9, 3.7, d) }}>
        {CARDS4.map((x) => (
          <MixBlock key={x} x={x} y={CARD_Y} cols={5} rows={4} at={CARDS_AT} />
        ))}
        <G t={{ opacity: [[0, 0], [CARDS_AT - 0.05, 0], [CARDS_AT + 0.05, 1], [CARDS_AT + 0.6, 1], [CARDS_AT + 0.8, 0], [d, 0]] }}>
          <EdgeBox x={40} y={CARD_Y} w={240} h={40} />
        </G>
      </G>
      <G t={{ y: ab(0, 52, 2.9, 3.7, d) }}>
        <MixBlock x={40} y={110} cols={24} rows={1} at={3.75} flash={[2.8, 3.8]} />
      </G>

      {/* cta */}
      <MixBlock x={40} y={184} cols={24} rows={3} at={4.95} flash={[4.95, 5.4]} />

      <GoLive id="d" t={6.1} boxes={[[40, 48, 240, 50], ...CARDS4.map((x): [number, number, number, number] => [x, 110, CARD_W4, 40]), [40, 162, 240, 10], [40, 184, 240, 30]]} />

      <Person
        t={{
          x: [[0, 300], [0.4, 300], [1.05, 150], [2.45, 150], [2.75, 170], [3.7, 170], [4.15, 160], [4.7, 160], [4.9, 200], [5.2, 200], [5.6, 290], [d, 290]],
          y: [[0, 236], [0.4, 236], [1.05, 72], [2.45, 72], [2.75, 116], [2.9, 116], [3.7, 168], [4.15, 130], [4.7, 130], [4.9, 199], [5.2, 199], [5.6, 18], [d, 18]],
          opacity: [[0, 0], [0.4, 0], [0.6, 1], [6.3, 1], [6.7, 0], [d, 0]],
          scale: [[0, 1], [1.05, 1], [1.12, 0.82], [1.22, 1], [2.45, 1], [2.5, 0.82], [2.6, 1], [2.75, 1], [2.82, 0.85], [3.7, 0.85], [3.8, 1], [4.25, 1], [4.32, 0.82], [4.42, 1], [4.9, 1], [4.97, 0.82], [5.07, 1], [5.6, 1], [5.67, 0.82], [5.77, 1], [d, 1]],
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

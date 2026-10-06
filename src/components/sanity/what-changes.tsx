"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Reveal, SectionLabel } from "./shared";

/**
 * 84px icons in the Vibe Fixer "Why tonik" language (dark base #383838 + one #666 idea),
 * drawn with the page's own vocabulary: grid cells, edge + nodes, dashed = AI, solid = person.
 * Ambient motion: one slow move per icon, staggered so only one icon moves at a time.
 */
const D = "#383838";
const G = "#666666";
const N = "#888888";
const PERIOD = 9; // s, whole cycle across the six icons
const io = [0.65, 0, 0.35, 1] as const;

const cells = (x: number, y: number, cols: number, rows: number, s = 12) => {
  let d = "";
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) d += `M${x + k * s + 0.5} ${y + r * s + 0.5}h${s}v${s}h${-s}Z`;
  return d;
};
const Nodes = ({ pts }: { pts: [number, number][] }) => (
  <>
    {pts.map(([x, y], i) => (
      <rect key={i} x={x - 1.5} y={y - 1.5} width="3.5" height="3.5" fill="#212121" stroke={N} strokeWidth="0.75" />
    ))}
  </>
);
const corners = (x: number, y: number, w: number, h: number): [number, number][] => [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];

/** One slow move out and back (1.2s each way, 2.2s hold), then rest; icons start a slot apart. */
const TIMES = [0, 1.2 / PERIOD, 3.4 / PERIOD, 4.6 / PERIOD, 1];
function Drift({ i, on, to, children }: { i: number; on: boolean; to: Record<string, number>; children: React.ReactNode }) {
  const animate: Record<string, number[]> = {};
  const from: Record<string, number> = {};
  for (const [k, v] of Object.entries(to)) {
    const base = k === "opacity" ? 1 : 0;
    from[k] = base;
    animate[k] = [base, v, v, base, base];
  }
  return (
    <motion.g
      initial={from}
      animate={on ? animate : from}
      transition={on ? { duration: PERIOD, times: TIMES, ease: io, repeat: Infinity, delay: 0.6 + i * (PERIOD / 6) } : { duration: 0.4 }}
    >
      {children}
    </motion.g>
  );
}

type IconFn = (on: boolean) => React.ReactNode;
const icons: IconFn[] = [
  // Launch campaigns faster — a draft comes out of the system (dashed = drafted by AI)
  (on) => (
    <>
      <path d={cells(18, 18, 2, 2, 24)} stroke={D} />
      <Drift i={0} on={on} to={{ x: 6, y: 6 }}>
        <rect x="42.5" y="42.5" width="24" height="24" stroke={G} strokeDasharray="3 2.5" fill="#212121" />
        <Nodes pts={corners(42.5, 42.5, 24, 24)} />
      </Drift>
    </>
  ),
  // Adapt for each audience — one page, versions fanned out from it
  (on) => (
    <>
      <rect x="18.5" y="30.5" width="36" height="36" stroke={D} />
      <Drift i={1} on={on} to={{ x: 3, y: -3 }}>
        <rect x="26.5" y="22.5" width="36" height="36" stroke={G} />
      </Drift>
      <Drift i={1} on={on} to={{ x: 6, y: -6 }}>
        <rect x="34.5" y="14.5" width="36" height="36" stroke={G} />
      </Drift>
    </>
  ),
  // Test more ideas — A and B, a split, one signal travelling between them
  (on) => (
    <>
      <rect x="14.5" y="24.5" width="24" height="36" stroke={D} />
      <rect x="46.5" y="24.5" width="24" height="36" stroke={D} />
      <line x1="42.5" y1="16" x2="42.5" y2="68" stroke={G} strokeDasharray="2 2.5" />
      <Drift i={2} on={on} to={{ x: 32 }}>
        <rect x="23.5" y="39.5" width="6" height="6" stroke={G} fill="#212121" />
      </Drift>
    </>
  ),
  // Keep every page on-brand — approved patterns selected on the grid (edge + nodes)
  (on) => (
    <>
      <path d={cells(18, 18, 2, 2, 24)} stroke={D} />
      <Drift i={3} on={on} to={{ x: 24, y: 24 }}>
        <rect x="18.5" y="18.5" width="24" height="24" stroke={G} />
        <Nodes pts={corners(18.5, 18.5, 24, 24)} />
      </Drift>
    </>
  ),
  // Reuse your strongest content — one block, copied into a new slot
  (on) => (
    <>
      <path d={cells(12, 34, 3, 1, 20)} stroke={D} />
      <rect x="12.5" y="34.5" width="20" height="20" stroke={G} />
      <rect x="18" y="40" width="9" height="9" fill={G} />
      <Drift i={4} on={on} to={{ opacity: 0.15 }}>
        <rect x="52.5" y="34.5" width="20" height="20" stroke={G} strokeDasharray="2.5 2" />
        <rect x="58" y="40" width="9" height="9" fill={G} opacity="0.6" />
      </Drift>
    </>
  ),
  // Review and publish with confidence — a person (solid circle) approves
  (on) => (
    <>
      <rect x="18.5" y="18.5" width="48" height="48" stroke={D} />
      <circle cx="42" cy="42" r="17.5" stroke={G} />
      <Drift i={5} on={on} to={{ opacity: 0.2 }}>
        <path d="M34 42.5L40 48.5L51 36.5" stroke={G} />
      </Drift>
    </>
  ),
];

function Icon({ i }: { i: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  return (
    <svg ref={ref} viewBox="0 0 84 84" fill="none" className="m-[-18px] size-[84px]">
      {icons[i](inView && !reduce)}
    </svg>
  );
}

const items = [
  ["Launch campaigns faster", "Turn a brief into a Sanity draft without starting from scratch."],
  ["Adapt campaigns for each audience", "Create versions for markets, segments, and languages."],
  ["Test more ideas", "Create, preview, and measure page variations faster."],
  ["Keep every page on-brand", "Use layouts and content patterns your team has approved."],
  ["Reuse your strongest content", "Reuse customer stories, product messages, and CTAs."],
  ["Review and publish with confidence", "Keep staging, approvals, and publishing under control."],
];

export function SanityWhatChanges() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>What changes for your team</SectionLabel>
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[340px_1fr]">
        <Reveal>
          <p className="text-3xl leading-10 text-off-white">
            Marketing moves faster. <span className="text-off-white-light">The website stays consistent.</span>
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-3">
          {items.map(([title, text], i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="flex flex-col gap-6">
              <Icon i={i} />
              <div className="flex w-full flex-col text-base leading-6">
                <p className="text-off-white">{title}</p>
                <p className="text-off-white-light">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

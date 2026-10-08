"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type MotionStyle } from "motion/react";
import { Reveal, SectionLabel } from "./shared";

/**
 * 84px icons in the Vibe Fixer "Why tonik" language (dark base #383838 + one #666 idea),
 * drawn as pages and blocks — the same vocabulary as the hero and the example scenes.
 * Ambient motion: one slow move per icon, staggered so only one icon moves at a time.
 */
const D = "#383838";
const G = "#666666";
const PERIOD = 9; // s, whole cycle across the six icons
const io = [0.65, 0, 0.35, 1] as const;


/** One slow move out and back (1.2s each way, 2.2s hold), then rest; icons start a slot apart. */
const TIMES = [0, 1.2 / PERIOD, 3.4 / PERIOD, 4.6 / PERIOD, 1];
export function Drift({ i, on, to, style, children }: { i: number; on: boolean; to: Record<string, number>; style?: MotionStyle; children: React.ReactNode }) {
  const animate: Record<string, number[]> = {};
  const from: Record<string, number> = {};
  for (const [k, v] of Object.entries(to)) {
    const base = k === "opacity" || k.startsWith("scale") ? 1 : 0;
    from[k] = base;
    animate[k] = [base, v, v, base, base];
  }
  return (
    <motion.g
      style={style}
      initial={from}
      animate={on ? animate : from}
      transition={on ? { duration: PERIOD, times: TIMES, ease: io, repeat: Infinity, delay: 0.6 + i * (PERIOD / 6) } : { duration: 0.4 }}
    >
      {children}
    </motion.g>
  );
}

type IconFn = (on: boolean) => React.ReactNode;
// Vibe Fixer level of abstraction: one dark base shape (#383838) + one grey idea (#666).
export const icons: IconFn[] = [
  // Launch campaigns faster — a brief (speed lines) pushes a page forward
  (on) => (
    <>
      <rect x="20.5" y="28.5" width="36" height="36" stroke={D} />
      <path d="M6 37H18M10 44H18M6 51H18" stroke={G} />
      <Drift i={0} on={on} to={{ x: 4, y: -4 }}>
        <rect x="38.5" y="14.5" width="30" height="30" stroke={G} />
      </Drift>
    </>
  ),
  // Adapt campaigns for each audience — one page, versions in other sizes
  (on) => (
    <>
      <rect x="12.5" y="24.5" width="36" height="36" stroke={D} />
      <Drift i={1} on={on} to={{ x: 3 }}>
        <rect x="44.5" y="30.5" width="24" height="24" stroke={G} />
        <rect x="64.5" y="36.5" width="12" height="12" stroke={G} />
      </Drift>
    </>
  ),
  // Test more ideas — A and B; the focus moves between them
  (on) => (
    <>
      <rect x="12.5" y="24.5" width="26" height="36" stroke={D} />
      <rect x="45.5" y="24.5" width="26" height="36" stroke={D} />
      <Drift i={2} on={on} to={{ x: -33 }}>
        <circle cx="58.5" cy="42.5" r="11" stroke={G} />
      </Drift>
    </>
  ),
  // Keep every page on-brand — pages held by the same line
  (on) => (
    <>
      <rect x="10.5" y="30.5" width="20" height="24" stroke={D} />
      <rect x="32.5" y="30.5" width="20" height="24" stroke={D} />
      <rect x="54.5" y="30.5" width="20" height="24" stroke={D} />
      <Drift i={3} on={on} to={{ opacity: 0.2 }}>
        <path d="M4 38.5H80" stroke={G} />
      </Drift>
    </>
  ),
  // Reuse your strongest content — the same block, again
  (on) => (
    <>
      <rect x="12.5" y="28.5" width="28" height="28" stroke={D} />
      <rect x="44.5" y="28.5" width="28" height="28" stroke={D} />
      <rect x="20.5" y="36.5" width="12" height="12" stroke={G} />
      <Drift i={4} on={on} to={{ opacity: 0.1 }}>
        <rect x="52.5" y="36.5" width="12" height="12" stroke={G} />
      </Drift>
    </>
  ),
  // Review and publish with confidence — a page and its switch
  (on) => (
    <>
      <rect x="22.5" y="14.5" width="40" height="40" stroke={D} />
      <rect x="26.5" y="62.5" width="32" height="12" rx="6" stroke={G} />
      <Drift i={5} on={on} to={{ x: 18 }}>
        <circle cx="33" cy="68.5" r="3.5" stroke={G} />
      </Drift>
    </>
  ),
];

function Icon({ i }: { i: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden ref={ref} viewBox="0 0 84 84" fill="none" className="m-[-18px] size-[84px]">
      {icons[i](inView && !reduce)}
    </svg>
  );
}

// Order and copy exactly as V1. `icon` points into `icons`.
const items: { title: string; text: string; icon: number }[] = [
  { title: "Launch campaigns faster", text: "Turn a brief into a Sanity draft without starting from scratch.", icon: 0 },
  { title: "Keep every page on-brand", text: "Use layouts and content patterns your team has approved.", icon: 3 },
  { title: "Reuse your strongest content", text: "Reuse customer stories, product messages, and CTAs.", icon: 4 },
  { title: "Adapt campaigns for each audience", text: "Create versions for markets, segments, and languages.", icon: 1 },
  { title: "Test more ideas", text: "Create, preview, and measure page variations faster.", icon: 2 },
  { title: "Review and publish with confidence", text: "Keep staging, approvals, and publishing under control.", icon: 5 },
];

export function SanityWhatChanges() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>What changes for your team</SectionLabel>
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[420px_1fr]">
        <Reveal>
          <p className="text-3xl leading-10 text-off-white">
            Marketing moves faster. <span className="text-off-white-light">The website stays consistent.</span>
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 sm:gap-y-14 md:grid-cols-3">
          {items.map(({ title, text, icon }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="flex flex-row items-start gap-6 sm:flex-col">
              <div className="shrink-0">
                <Icon i={icon} />
              </div>
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

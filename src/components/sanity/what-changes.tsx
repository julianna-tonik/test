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
const N = "#888888";
const PERIOD = 9; // s, whole cycle across the six icons
const io = [0.65, 0, 0.35, 1] as const;


/** One slow move out and back (1.2s each way, 2.2s hold), then rest; icons start a slot apart. */
const TIMES = [0, 1.2 / PERIOD, 3.4 / PERIOD, 4.6 / PERIOD, 1];
function Drift({ i, on, to, style, children }: { i: number; on: boolean; to: Record<string, number>; style?: MotionStyle; children: React.ReactNode }) {
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
const icons: IconFn[] = [
  // Launch campaigns faster — a brief (lines) goes into a page and becomes a draft
  (on) => (
    <>
      <rect x="40.5" y="18.5" width="30" height="46" stroke={D} />
      <rect x="45.5" y="24.5" width="20" height="10" stroke={G} strokeDasharray="2.5 2" />
      <rect x="45.5" y="39.5" width="20" height="19" stroke={G} strokeDasharray="2.5 2" />
      <Drift i={0} on={on} to={{ x: 14, opacity: 0 }}>
        <path d="M12 33H32M12 40H28M12 47H32" stroke={G} />
      </Drift>
    </>
  ),
  // Adapt campaigns for each audience — one page branches into versions
  (on) => (
    <>
      <rect x="12.5" y="28.5" width="22" height="28" stroke={D} />
      <path d="M35 42.5H42M42 20.5V64.5M42 20.5H48M42 42.5H48M42 64.5H48" stroke={D} />
      <Drift i={1} on={on} to={{ x: 3 }}>
        <rect x="48.5" y="14.5" width="22" height="13" stroke={G} />
        <rect x="48.5" y="36.5" width="22" height="13" stroke={G} />
        <rect x="48.5" y="58.5" width="22" height="13" stroke={G} />
      </Drift>
    </>
  ),
  // Test more ideas — A and B, measured: B's result grows
  (on) => (
    <>
      <rect x="12.5" y="16.5" width="26" height="34" stroke={D} />
      <rect x="45.5" y="16.5" width="26" height="34" stroke={D} />
      <rect x="17.5" y="22.5" width="16" height="6" stroke={G} />
      <rect x="50.5" y="22.5" width="16" height="10" stroke={G} />
      <rect x="12.5" y="60.5" width="14" height="4" stroke={G} />
      <Drift i={2} on={on} to={{ scaleX: 1.35 }} style={{ originX: 0 }}>
        <rect x="45.5" y="60.5" width="20" height="4" fill={G} />
      </Drift>
    </>
  ),
  // Keep every page on-brand — every page shares the same approved structure
  (on) => (
    <>
      {[12, 33, 54].map((x) => (
        <g key={x}>
          <rect x={x + 0.5} y="22.5" width="18" height="40" stroke={D} />
          <rect x={x + 3.5} y="26.5" width="12" height="8" stroke={G} />
          <rect x={x + 3.5} y="38.5" width="12" height="4" stroke={G} />
        </g>
      ))}
      <Drift i={3} on={on} to={{ opacity: 0 }}>
        <path d="M8 30.5H76" stroke={N} strokeDasharray="2 2.5" />
      </Drift>
    </>
  ),
  // Reuse your strongest content — one proven block placed into more pages
  (on) => (
    <>
      <rect x="12.5" y="35.5" width="14" height="14" stroke={G} />
      <rect x="16" y="39" width="7" height="7" fill={G} />
      <path d="M27 42.5H34M34 24.5V60.5M34 24.5H42M34 60.5H42" stroke={D} />
      <rect x="42.5" y="12.5" width="28" height="24" stroke={D} />
      <rect x="49" y="19" width="7" height="7" fill={G} />
      <rect x="42.5" y="48.5" width="28" height="24" stroke={D} />
      <Drift i={4} on={on} to={{ opacity: 0.15 }}>
        <rect x="49" y="55" width="7" height="7" fill={G} />
      </Drift>
    </>
  ),
  // Review and publish with confidence — the page goes live when you switch it
  (on) => (
    <>
      <rect x="18.5" y="12.5" width="48" height="40" stroke={D} />
      <rect x="24.5" y="19.5" width="28" height="5" stroke={G} />
      <rect x="24.5" y="29.5" width="18" height="5" stroke={G} />
      <rect x="30.5" y="60.5" width="24" height="12" rx="6" stroke={G} />
      <Drift i={5} on={on} to={{ x: 12 }}>
        <circle cx="36.5" cy="66.5" r="3.5" fill={N} />
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
      <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-[340px_1fr]">
        <Reveal>
          <p className="text-3xl leading-10 text-off-white">
            Marketing moves faster. <span className="text-off-white-light">The website stays consistent.</span>
          </p>
        </Reveal>
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:grid-cols-3">
          {items.map(({ title, text, icon }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.08} className="flex flex-col gap-6">
              <Icon i={icon} />
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

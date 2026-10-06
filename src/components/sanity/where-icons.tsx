"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Drift } from "./what-changes";

/** "Where it can go" micro illustrations — same 84px VF language as the "What changes" icons. */
const D = "#383838";
const G = "#666666";

const icons: ((on: boolean) => React.ReactNode)[] = [
  // Create pages from familiar tools — a message becomes a page
  (on) => (
    <>
      <path d="M10.5 26.5h30v20h-18l-6 6v-6h-6z" stroke={D} />
      <rect x="48.5" y="22.5" width="26" height="34" stroke={D} />
      <Drift i={0} on={on} to={{ x: 34, opacity: 0.2 }}>
        <rect x="18.5" y="32.5" width="10" height="8" stroke={G} />
      </Drift>
    </>
  ),
  // Handle repetitive work — the same page, many times
  (on) => (
    <>
      <rect x="14.5" y="18.5" width="28" height="36" stroke={D} />
      <rect x="28.5" y="26.5" width="28" height="36" stroke={D} />
      <Drift i={2} on={on} to={{ x: 14, y: 8 }}>
        <rect x="42.5" y="34.5" width="28" height="36" stroke={G} />
      </Drift>
    </>
  ),
  // Connect external systems — the site plugged into other tools
  (on) => (
    <>
      <rect x="30.5" y="30.5" width="24" height="24" stroke={D} />
      <path d="M42.5 30V16M54 42.5H68M42.5 55V68" stroke={D} />
      <rect x="38.5" y="8.5" width="8" height="8" stroke={G} />
      <rect x="68.5" y="38.5" width="8" height="8" stroke={G} />
      <Drift i={4} on={on} to={{ y: 6 }}>
        <rect x="38.5" y="68.5" width="8" height="8" stroke={G} />
      </Drift>
    </>
  ),
];

export function WhereIcon({ i }: { i: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden ref={ref} viewBox="0 0 84 84" fill="none" className="aspect-square h-auto w-full md:w-[62%] md:max-w-[180px]">
      {icons[i](inView && !reduce)}
    </svg>
  );
}

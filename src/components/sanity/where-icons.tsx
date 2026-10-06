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
      <path d="M8.5 24.5h30v20h-18l-6 6v-6h-6z" stroke={D} />
      <rect x="48.5" y="20.5" width="26" height="36" stroke={D} />
      <rect x="53.5" y="26.5" width="16" height="4" stroke={D} />
      <Drift i={0} on={on} to={{ x: 37, y: 8, opacity: 0.3 }}>
        <rect x="16.5" y="30.5" width="16" height="8" stroke={G} />
      </Drift>
    </>
  ),
  // Handle repetitive work — one page, copied again and again
  (on) => (
    <>
      <rect x="12.5" y="14.5" width="24" height="32" stroke={D} />
      <rect x="26.5" y="24.5" width="24" height="32" stroke={D} />
      <Drift i={2} on={on} to={{ x: 8, y: 6 }}>
        <rect x="40.5" y="34.5" width="24" height="32" stroke={G} />
        <rect x="45.5" y="40.5" width="14" height="4" stroke={G} />
      </Drift>
    </>
  ),
  // Connect external systems — the site wired to four other tools
  (on) => (
    <>
      <rect x="31.5" y="31.5" width="22" height="22" stroke={D} />
      <path d="M42.5 31V19M42.5 54V66M31 42.5H19M54 42.5H66" stroke={D} />
      <rect x="38.5" y="10.5" width="8" height="8" stroke={G} />
      <rect x="10.5" y="38.5" width="8" height="8" stroke={G} />
      <rect x="66.5" y="38.5" width="8" height="8" stroke={G} />
      <Drift i={4} on={on} to={{ y: 5 }}>
        <rect x="38.5" y="66.5" width="8" height="8" stroke={G} />
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

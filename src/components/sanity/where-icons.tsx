"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Drift } from "./what-changes";

/** "Where it can go" micro illustrations — literal version: a chat, language copies, connected tools. */
const D = "#383838";
const G = "#666666";
const T = "#888888";
const mono = { fontFamily: "var(--font-mono)", fontSize: 6.5, letterSpacing: 0.2 } as const;

const icons: ((on: boolean) => React.ReactNode)[] = [
  // Create pages from familiar tools — a chat message turns into a page
  (on) => (
    <>
      <path d="M6.5 22.5h36v22h-22l-6 6v-6h-8z" stroke={D} />
      <rect x="12" y="29" width="22" height="2.5" fill={G} />
      <rect x="12" y="35" width="15" height="2.5" fill={G} />
      <rect x="50.5" y="20.5" width="28" height="36" stroke={D} />
      <rect x="55" y="26" width="14" height="3" fill={G} />
      <Drift i={0} on={on} to={{ opacity: 0.15 }}>
        <rect x="55" y="34" width="19" height="9" fill="#2c2c2c" stroke={G} />
        <rect x="55" y="47" width="12" height="2.5" fill={G} />
      </Drift>
    </>
  ),
  // Handle repetitive work — one page, its language copies
  (on) => (
    <>
      {["EN", "DE", "FR"].map((l, k) => (
        <g key={l}>
          <rect x={10.5 + k * 22} y={22.5} width="20" height="28" stroke={k === 0 ? G : D} />
          <rect x={14 + k * 22} y={27} width="10" height="2.5" fill={k === 0 ? G : D} />
          <text x={14 + k * 22} y={46} fill={k === 0 ? T : "#555"} style={mono}>{l}</text>
        </g>
      ))}
      <Drift i={2} on={on} to={{ x: 44 }}>
        <rect x="10.5" y="56.5" width="20" height="3" fill={G} />
      </Drift>
    </>
  ),
  // Connect external systems — the CMS wired to CRM, analytics, translation and an internal API
  (on) => (
    <>
      <rect x="29.5" y="33.5" width="26" height="18" stroke={G} />
      <text x="33.5" y="45" fill={T} style={mono}>CMS</text>
      <path d="M42.5 33V22M42.5 52V63M29 42.5H24" stroke={D} />
      <rect x="30.5" y="9.5" width="24" height="12" stroke={D} />
      <text x="34" y="18" fill="#555" style={mono}>CRM</text>
      <rect x="1.5" y="36.5" width="22" height="12" stroke={D} />
      <text x="4" y="45" fill="#555" style={mono}>I18N</text>
      <rect x="30.5" y="63.5" width="24" height="12" stroke={D} />
      <text x="35.5" y="72" fill="#555" style={mono}>GA4</text>
      {/* the right one connects: its line draws in, then the tool lights up */}
      <Drift i={4} on={on} to={{ scaleX: 0 }} style={{ transformBox: "fill-box", originX: 0 }}>
        <path d="M56 42.5H61" stroke={D} />
      </Drift>
      <Drift i={4} on={on} to={{ opacity: 0.25 }}>
        <rect x="61.5" y="36.5" width="21" height="12" stroke={D} />
        <text x="65" y="45" fill="#555" style={mono}>API</text>
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

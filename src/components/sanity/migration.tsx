"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { List, ListItem } from "@/components/ui/list-item";
import { Reveal, SectionLabel, easeOut } from "./shared";

const Cm = 20;

/** Webflow lane stays complete; the Sanity lane fills in stages (re-import highlighted). */
function Lanes() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });
  const reduce = useReducedMotion();
  const on = reduce || inView;
  const sanity: { k: number; r: number }[] = [];
  for (let k = 0; k < 24; k++) for (let r = 0; r < 2; r++) if (!((k === 23 && r === 0) || (k === 22 && r === 1))) sanity.push({ k, r });

  return (
    <svg ref={ref} viewBox="0 0 620 196" fill="none" className="block h-auto w-full" style={{ fontFamily: "var(--font-mono)" }}>
      <text x="0" y="11" fill="#888" fontSize="11">WEBFLOW — LIVE</text>
      {Array.from({ length: 60 }, (_, i) => (
        <rect key={i} x={(i % 30) * Cm + 0.5} y={22 + Math.floor(i / 30) * Cm + 0.5} width={Cm} height={Cm} fill="#2d2d2d" stroke="#4a4a4a" />
      ))}
      {sanity.map(({ k, r }) => {
        const hi = k >= 18;
        return (
          <motion.rect
            key={`${k}-${r}`}
            x={k * Cm + 0.5}
            y={112 + r * Cm + 0.5}
            width={Cm}
            height={Cm}
            fill={hi ? "#5a5a5a" : "#2d2d2d"}
            stroke={hi ? "#efefef" : "#4a4a4a"}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            initial={false}
            animate={on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.6, ease: easeOut, delay: on ? (k * 45 + r * 20) / 1000 : 0 }}
          />
        );
      })}
      <line x1="200.5" y1="104" x2="200.5" y2="160" stroke="#555" />
      <line x1="360.5" y1="104" x2="360.5" y2="160" stroke="#555" />
      <text x="0" y="186" fill="#888" fontSize="11">SANITY — IMPORT 01</text>
      <text x="206" y="186" fill="#555" fontSize="11">IMPORT 02</text>
      <text x="366" y="186" fill="#efefef" fontSize="11">RE-IMPORT</text>
    </svg>
  );
}

export function SanityMigration() {
  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[120px] pb-[120px]">
      <SectionLabel>Migration</SectionLabel>
      <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[420px_1fr]">
        <Reveal className="flex flex-col gap-6">
          <p className="text-2xl text-off-white md:text-3xl">Move to Sanity without putting the website on hold</p>
          <p className="text-base leading-6 text-off-white-light">We migrate Webflow content while your current website keeps running.</p>
          <List>
            <ListItem>Move in stages.</ListItem>
            <ListItem>Repeat the import as content changes.</ListItem>
            <ListItem>No content freeze.</ListItem>
          </List>
        </Reveal>
        <Lanes />
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-3">
          <Separator />
          <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">Where it can go</p>
        </div>
        <Reveal className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[420px_repeat(3,1fr)]">
          <p className="text-3xl leading-10 text-off-white">
            Start with pages. <span className="text-off-white-light">Expand when it makes sense.</span>
          </p>
          <p className="text-base leading-6">Create pages from familiar tools. <span className="text-off-white-light">Start a request in Slack, Claude, Codex, or another tool.</span></p>
          <p className="text-base leading-6">Handle repetitive work. <span className="text-off-white-light">Manage translations, metadata, and bulk updates.</span></p>
          <p className="text-base leading-6">Connect external systems. <span className="text-off-white-light">Add analytics, CRM, translation, or internal tools.</span></p>
        </Reveal>
      </div>
    </section>
  );
}

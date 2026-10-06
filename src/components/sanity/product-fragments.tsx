"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOut } from "./shared";
import { Actor, ActorTag } from "./actor";

const REQUEST =
  "Create an NYC version of our event page for enterprise security teams. Reuse the existing template and customer stories.";
const SECTIONS = ["Hero", "Logo row", "Stories", "CTA"];

type Phase = 0 | 1 | 2;
const PHASE_MS: Record<Phase, number> = { 0: 3800, 1: 3600, 2: 4600 };

const STEPS: { label: string; title: string; actor: Actor; who: string }[] = [
  { label: "01 Ask", title: "Ask for the page", actor: "human", who: "You" },
  { label: "02 Build", title: "Watch it assemble", actor: "ai", who: "AI" },
  { label: "03 Review", title: "Review the live draft", actor: "human", who: "Your team" },
];

function Check({ size = 10, color = "#888888" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.8 7L5.6 9.8L11.2 4.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const mono = "font-mono text-xs uppercase leading-3 tracking-tight";

function Panel({ active, head, meta, children }: { active: boolean; head: string; meta: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={cn("relative flex h-[320px] flex-col border bg-[#1c1c1c] transition-colors duration-700", active ? "border-[#4a4a4a]" : "border-dark-grey")}>
      <div className="flex items-center gap-2 border-b border-dark-grey px-4 py-3 text-off-white-light">
        <p className={mono}>{head}</p>
        <span className="flex-1" />
        {meta}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">{children}</div>
    </div>
  );
}

function Cursor() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
      <path d="M1.5 1.5L16 10.2L9.4 11.6L6.2 18L1.5 1.5Z" fill="#EFEFEF" stroke="#212121" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Three small Sanity UI fragments (Ask → Build → Review) — the hero visual. */
export function ProductFragments() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [cycle, setCycle] = useState(0);
  const [typed, setTyped] = useState(0);
  const [sent, setSent] = useState(false);
  const [rows, setRows] = useState(0);
  const [blocks, setBlocks] = useState(0);
  const [cursor, setCursor] = useState<"off" | "moving" | "click" | "done">("off");

  const reset = () => { setTyped(0); setSent(false); setRows(0); setBlocks(0); setCursor("off"); };

  // phase timeline
  useEffect(() => {
    if (reduce) {
      setTyped(REQUEST.length); setSent(true); setRows(SECTIONS.length); setBlocks(4); setCursor("done"); setPhase(2);
      return;
    }
    if (!inView) return;
    const t = setTimeout(() => {
      if (phase === 2) { reset(); setCycle((c) => c + 1); setPhase(0); }
      else setPhase((phase + 1) as Phase);
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, inView, reduce]);

  // 01: typing, then "sent to Sanity"
  useEffect(() => {
    if (reduce || phase !== 0 || !inView) return;
    if (typed >= REQUEST.length) {
      const t = setTimeout(() => setSent(true), 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setTyped((n) => Math.min(REQUEST.length, n + 2)), 26);
    return () => clearTimeout(t);
  }, [typed, phase, inView, reduce]);

  // 02: sections come in from the approved library
  useEffect(() => {
    if (reduce || phase !== 1 || rows >= SECTIONS.length) return;
    const t = setTimeout(() => setRows((n) => n + 1), rows === 0 ? 250 : 650);
    return () => clearTimeout(t);
  }, [rows, phase, reduce]);

  // 03: preview builds, then a person clicks Publish
  useEffect(() => {
    if (reduce || phase !== 2) return;
    if (blocks < 4) {
      const t = setTimeout(() => setBlocks((n) => n + 1), blocks === 0 ? 200 : 300);
      return () => clearTimeout(t);
    }
    const next = { off: ["moving", 300], moving: ["click", 1000], click: ["done", 260] } as const;
    if (cursor === "done") return;
    const [to, ms] = next[cursor];
    const t = setTimeout(() => setCursor(to), ms);
    return () => clearTimeout(t);
  }, [blocks, cursor, phase, reduce]);

  const published = cursor === "done";

  return (
    <div ref={ref} className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 01 ASK — a person writes the request in a tool they already use */}
      <Step index={0} phase={phase} cycle={cycle}>
        <Panel active={phase === 0} head="Claude · #marketing" meta={<span className={cn(mono, "text-[#555]")}>now</span>}>
          <p className={cn(mono, "text-[#555]")}>You</p>
          <p className="min-h-24 text-base leading-6 text-off-white">
            {REQUEST.slice(0, typed)}
            {phase === 0 && typed < REQUEST.length && (
              <span className="ml-px inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-off-white" />
            )}
          </p>
          <motion.p
            initial={false}
            animate={{ opacity: sent ? 1 : 0, y: sent ? 0 : 4 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className={cn(mono, "text-off-white-light")}
          >
            → Sent to Sanity Studio
          </motion.p>
          <div className="mt-auto flex items-center gap-2 border border-dark-grey py-1.5 pl-3 pr-1.5 text-[#555]">
            <span className="flex-1">Talk to your LLM…</span>
            <motion.span
              animate={sent && phase === 0 ? { scale: [1, 0.85, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex size-7 items-center justify-center rounded-full bg-off-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10.5V1.5M1.5 6L6 1.5 10.5 6" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </div>
        </Panel>
      </Step>

      {/* 02 BUILD — AI assembles the page from sections the team already approved */}
      <Step index={1} phase={phase} cycle={cycle}>
        <Panel
          active={phase === 1}
          head="Studio / Events / NYC Summit"
          meta={<span className="bg-off-white px-1.5 py-1 font-mono text-xs uppercase leading-3 tracking-tight text-off-black">Draft</span>}
        >
          <div className="flex items-center justify-between">
            <p className={cn(mono, "text-off-white-light")}>From your approved library</p>
            <p className={cn(mono, "text-[#555]")}>{rows}/{SECTIONS.length}</p>
          </div>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {SECTIONS.slice(0, rows).map((name, i) => {
                const settling = phase === 1 && i === rows - 1;
                return (
                  <motion.div
                    key={`${cycle}-${name}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: easeOut }}
                    className={cn(
                      "flex items-center gap-3 border p-3 text-off-white transition-colors duration-500",
                      settling ? "border-dashed border-off-white-light" : "border-dark-grey",
                    )}
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center border border-[#666]">
                      <motion.span initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45, duration: 0.4, ease: easeOut }} className="flex">
                        <Check />
                      </motion.span>
                    </span>
                    <span className="flex-1">{name}</span>
                    <span className={cn(mono, "text-[#555]")}>Approved</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Panel>
      </Step>

      {/* 03 REVIEW — the same NYC page on staging; a person publishes */}
      <Step index={2} phase={phase} cycle={cycle}>
        <Panel active={phase === 2} head="Live preview · staging" meta={<span className={cn(mono, "text-[#555]")}>/nyc-summit</span>}>
          <div className="flex flex-1 items-center">
            <svg viewBox="0 0 336 170" fill="none" className="w-full" style={{ fontFamily: "var(--font-sans)" }}>
              {[
                <g key="hero"><rect x=".5" y=".5" width="335" height="58" fill="#2a2a2a" stroke="#444" /><text x="14" y="22" fill="#888" fontSize="8" style={{ fontFamily: "var(--font-mono)" }}>ENTERPRISE SECURITY</text><text x="14" y="44" fill="#d0d0d0" fontSize="15">NYC Security Summit</text></g>,
                <g key="logos">{[0, 1, 2, 3].map((i) => <rect key={i} x={40.5 + i * 76} y="70.5" width="28" height="10" fill="#2a2a2a" stroke="#3a3a3a" />)}</g>,
                <g key="cards">{[0, 1, 2].map((i) => <rect key={i} x={0.5 + i * 114} y="92.5" width="106" height="42" fill="#262626" stroke="#3a3a3a" />)}</g>,
                <g key="cta"><rect x=".5" y="144.5" width="335" height="24" fill="#262626" stroke="#3a3a3a" /><rect x="14" y="154" width="96" height="4" fill="#555" /><rect x="292" y="151" width="32" height="10" fill="#888" /></g>,
              ].map((g, i) => (
                <motion.g key={i} initial={false} animate={{ opacity: i < blocks ? 1 : 0, y: i < blocks ? 0 : 6 }} transition={{ duration: 0.7, ease: easeOut }}>
                  {g}
                </motion.g>
              ))}
            </svg>
          </div>
          <div className="flex items-center gap-2 text-off-white-light">
            <motion.p
              key={published ? "approved" : "review"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className={cn(mono, "flex-1", published && "text-off-white")}
            >
              {published ? "Approved by your team" : "Review, edit, then publish"}
            </motion.p>
            <div className="relative">
              <motion.span
                animate={{ scale: cursor === "click" ? 0.94 : 1 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 font-mono text-sm uppercase tracking-tight transition-colors duration-300",
                  published ? "bg-dark-grey text-off-white" : "bg-off-white text-off-black",
                )}
              >
                {published ? "Published" : "Publish"}
                <span className={cn("flex size-4 items-center justify-center rounded-full transition-colors duration-300", published ? "bg-off-white" : "bg-off-black")}>
                  {published ? (
                    <Check size={10} color="#212121" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3"><path d="M1.5 6H10.5M10.5 6L6 1.5M10.5 6L6 10.5" stroke="#EFEFEF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  )}
                </span>
              </motion.span>
              {/* the human: a cursor travels in and clicks Publish */}
              <motion.span
                className="pointer-events-none absolute left-[55%] top-[45%] z-10"
                initial={false}
                animate={
                  cursor === "off"
                    ? { opacity: 0, x: 70, y: 46 }
                    : cursor === "moving"
                      ? { opacity: 1, x: 0, y: 0 }
                      : cursor === "click"
                        ? { opacity: 1, x: 0, y: 0, scale: 0.85 }
                        : { opacity: 0, x: 6, y: 10, scale: 1 }
                }
                transition={{ duration: cursor === "moving" ? 0.9 : 0.25, ease: easeOut, opacity: { duration: cursor === "done" ? 0.8 : 0.3, delay: cursor === "done" ? 0.6 : 0 } }}
              >
                <Cursor />
              </motion.span>
            </div>
          </div>
        </Panel>
      </Step>
    </div>
  );
}

function Step({ index, phase, cycle, children }: { index: Phase; phase: Phase; cycle: number; children: React.ReactNode }) {
  const active = phase === index;
  const done = phase > index;
  const step = STEPS[index];
  return (
    <div className="flex flex-col gap-5">
      {children}
      <div className="relative h-px w-full overflow-hidden bg-dark-grey">
        <motion.div
          key={`${cycle}-${active}`}
          className="absolute inset-0 origin-left bg-off-white"
          initial={{ scaleX: active ? 0 : done ? 1 : 0 }}
          animate={{ scaleX: active || done ? 1 : 0 }}
          transition={{ duration: active ? PHASE_MS[index] / 1000 : 0.6, ease: active ? "linear" : "easeInOut" }}
        />
      </div>
      <div className={cn("flex flex-col gap-2 transition-colors duration-700", active ? "text-off-white" : "text-off-white-light")}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm uppercase leading-none tracking-tight">{step.label}</p>
          <ActorTag actor={step.actor} label={step.who} />
        </div>
        <p className="text-xl leading-7">{step.title}</p>
      </div>
    </div>
  );
}

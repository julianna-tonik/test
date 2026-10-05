"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { easeOut } from "./shared";

const REQUEST =
  "Create an NYC version of our event page for enterprise security teams. Reuse the existing template and customer stories.";
const SECTIONS = ["Hero", "Logo row", "Stories", "CTA"];

type Phase = 0 | 1 | 2;
const PHASE_MS: Record<Phase, number> = { 0: 3400, 1: 3600, 2: 3600 };

const STEPS: { label: string; title: string }[] = [
  { label: "01 Ask", title: "Ask for the page" },
  { label: "02 Build", title: "Watch it assemble" },
  { label: "03 Review", title: "Review the live draft" },
];

function Check({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M2.8 7L5.6 9.8L11.2 4.2" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Panel({
  active,
  head,
  meta,
  children,
}: {
  active: boolean;
  head: string;
  meta: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-[320px] flex-col border bg-[#1c1c1c] transition-colors duration-700",
        active ? "border-[#4a4a4a]" : "border-dark-grey",
      )}
    >
      <div className="flex items-center gap-2 border-b border-dark-grey px-4 py-3 text-off-white-light">
        <p className="font-mono text-xs uppercase leading-3 tracking-tight">{head}</p>
        <span className="flex-1" />
        {meta}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">{children}</div>
    </div>
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
  const [rows, setRows] = useState(0);
  const [blocks, setBlocks] = useState(0);

  // phase timeline
  useEffect(() => {
    if (reduce) {
      setTyped(REQUEST.length); setRows(SECTIONS.length); setBlocks(4); setPhase(1);
      return;
    }
    if (!inView) return;
    const t = setTimeout(() => {
      if (phase === 2) { setTyped(0); setRows(0); setBlocks(0); setCycle((c) => c + 1); setPhase(0); }
      else setPhase(((phase + 1) as Phase));
    }, PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase, inView, reduce]);

  // typing in phase 0
  useEffect(() => {
    if (reduce || phase !== 0 || !inView) return;
    if (typed >= REQUEST.length) return;
    const t = setTimeout(() => setTyped((n) => Math.min(REQUEST.length, n + 2)), 26);
    return () => clearTimeout(t);
  }, [typed, phase, inView, reduce]);

  // sections in phase 1
  useEffect(() => {
    if (reduce || phase !== 1) return;
    if (rows >= SECTIONS.length) return;
    const t = setTimeout(() => setRows((n) => n + 1), rows === 0 ? 250 : 650);
    return () => clearTimeout(t);
  }, [rows, phase, reduce]);

  // preview blocks in phase 2
  useEffect(() => {
    if (reduce || phase !== 2) return;
    if (blocks >= 4) return;
    const t = setTimeout(() => setBlocks((n) => n + 1), blocks === 0 ? 200 : 320);
    return () => clearTimeout(t);
  }, [blocks, phase, reduce]);

  return (
    <div ref={ref} className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 01 ASK */}
      <Fragment index={0} phase={phase} cycle={cycle}>
        <Panel active={phase === 0} head="Claude · #marketing" meta={<span className="font-mono text-xs uppercase leading-3 tracking-tight text-[#555]">now</span>}>
          <p className="font-mono text-xs uppercase leading-3 tracking-tight text-[#555]">You</p>
          <p className="min-h-24 text-base leading-6 text-off-white">
            {REQUEST.slice(0, typed)}
            {phase === 0 && typed < REQUEST.length && (
              <span className="ml-px inline-block h-[18px] w-px translate-y-[3px] animate-pulse bg-off-white" />
            )}
          </p>
          <div className="mt-auto flex items-center gap-2 border border-dark-grey py-1.5 pl-3 pr-1.5 text-[#555]">
            <span className="flex-1">Talk to your LLM…</span>
            <motion.span
              animate={phase === 0 && typed >= REQUEST.length ? { scale: [1, 0.85, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex size-7 items-center justify-center rounded-full bg-off-white"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 10.5V1.5M1.5 6L6 1.5 10.5 6" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </div>
        </Panel>
      </Fragment>

      {/* 02 BUILD */}
      <Fragment index={1} phase={phase} cycle={cycle}>
        <Panel
          active={phase === 1}
          head="Studio / Events / NYC Summit"
          meta={<span className="bg-off-white px-1.5 py-1 font-mono text-xs uppercase leading-3 tracking-tight text-off-black">Draft</span>}
        >
          <p className="font-mono text-xs uppercase leading-3 tracking-tight text-off-white-light">Assembling approved sections</p>
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {SECTIONS.slice(0, rows).map((name, i) => {
                const settling = phase === 1 && i === rows - 1;
                return (
                  <motion.div
                    key={`${cycle}-${name}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: easeOut }}
                    className={cn(
                      "flex items-center gap-3 border p-3 text-off-white transition-colors duration-500",
                      settling ? "border-dashed border-off-white-light" : "border-dark-grey",
                    )}
                  >
                    <span className="flex size-3.5 shrink-0 items-center justify-center border border-[#666]">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.45, duration: 0.4, ease: easeOut }}
                        className="flex"
                      >
                        <Check />
                      </motion.span>
                    </span>
                    <span>{name}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Panel>
      </Fragment>

      {/* 03 REVIEW */}
      <Fragment index={2} phase={phase} cycle={cycle}>
        <Panel active={phase === 2} head="Live preview · staging" meta={<span className="font-mono text-xs leading-3 text-[#555]">↗</span>}>
          <div className="flex flex-1 items-center">
            <svg viewBox="0 0 336 176" fill="none" className="w-full">
              {[
                <g key="hero"><rect x=".5" y=".5" width="335" height="60" fill="#2a2a2a" stroke="#444" /><rect x="16" y="16" width="96" height="5" fill="#555" /><rect x="16" y="36" width="172" height="8" fill="#6a6a6a" /></g>,
                <g key="logos">{[0, 1, 2, 3].map((i) => <rect key={i} x={40.5 + i * 76} y="74.5" width="28" height="10" fill="#2a2a2a" stroke="#3a3a3a" />)}</g>,
                <g key="cards">{[0, 1, 2].map((i) => <rect key={i} x={0.5 + i * 114} y="98.5" width="106" height="42" fill="#262626" stroke="#3a3a3a" />)}</g>,
                <g key="cta"><rect x=".5" y="150.5" width="335" height="24" fill="#262626" stroke="#3a3a3a" /><rect x="14" y="160" width="96" height="4" fill="#555" /><rect x="292" y="157" width="32" height="10" fill="#888" /></g>,
              ].map((g, i) => (
                <motion.g
                  key={i}
                  initial={false}
                  animate={{ opacity: i < blocks ? 1 : 0, y: i < blocks ? 0 : 6 }}
                  transition={{ duration: 0.7, ease: easeOut }}
                >
                  {g}
                </motion.g>
              ))}
            </svg>
          </div>
          <div className="flex items-center gap-2 text-off-white-light">
            <p className="flex-1 font-mono text-xs uppercase leading-3 tracking-tight">Review, edit, then publish</p>
            <motion.span
              animate={{ boxShadow: phase === 2 && blocks >= 4 ? "0 0 0 4px rgba(239,239,239,0.12)" : "0 0 0 0 rgba(239,239,239,0)" }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-off-white px-3 py-2 font-mono text-sm uppercase tracking-tight text-off-black"
            >
              Publish
              <span className="flex size-4 items-center justify-center rounded-full bg-off-black">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3"><path d="M1.5 6H10.5M10.5 6L6 1.5M10.5 6L6 10.5" stroke="#EFEFEF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </motion.span>
          </div>
        </Panel>
      </Fragment>
    </div>
  );
}

function Fragment({
  index,
  phase,
  cycle,
  children,
}: {
  index: Phase;
  phase: Phase;
  cycle: number;
  children: React.ReactNode;
}) {
  const active = phase === index;
  const done = phase > index;
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
        <p className="font-mono text-sm uppercase leading-none tracking-tight">{STEPS[index].label}</p>
        <p className="text-xl leading-7">{STEPS[index].title}</p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { ActorTag } from "./actor";
import { PANELS, PHASE_S, PanelCtx, STEPS, type Mode } from "./product-fragments";

/**
 * Three ways to show the hero's Ask → Build → Review on a phone as ONE element
 * instead of three stacked panels. All share the same loop: each phase plays its panel,
 * then the next one starts; tapping / swiping jumps to a step and the loop carries on from there.
 */

type Phase = 0 | 1 | 2;
const ease = [0.65, 0, 0.35, 1] as const;

function useHeroLoop(inView: boolean) {
  const reduce = !!useReducedMotion();
  const [phase, setPhase] = useState<Phase>(0);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    const t = setTimeout(() => {
      if (phase === 2) { setCycle((c) => c + 1); setPhase(0); }
      else setPhase((phase + 1) as Phase);
    }, PHASE_S[phase] * 1000 + 300);
    return () => clearTimeout(t);
  }, [phase, cycle, inView, reduce]);
  // a manual jump restarts the step (new cycle key → its progress bar and panel replay)
  const go = (p: number) => { setPhase(((p + 3) % 3) as Phase); setCycle((c) => c + 1); };
  return { phase, cycle, go, reduce };
}

const modeOf = (idx: number, phase: number, reduce: boolean): Mode => (reduce || phase > idx ? "after" : phase === idx ? "play" : "before");

function Panel({ idx, mode, dim = true }: { idx: number; mode: Mode; dim?: boolean }) {
  const P = PANELS[idx];
  return (
    <div className={cn("relative aspect-[4/3] w-full border bg-[#1c1c1c] transition-colors duration-700", mode === "play" ? "border-[#4a4a4a]" : "border-dark-grey")}>
      <PanelCtx.Provider value={{ mode, dur: PHASE_S[idx as Phase] }}>
        <svg aria-hidden viewBox="0 0 320 240" fill="none" className={cn("absolute inset-0 h-full w-full transition-opacity duration-700", !dim || mode === "play" ? "opacity-100" : "opacity-45")}>
          <P />
        </svg>
      </PanelCtx.Provider>
    </div>
  );
}

/** Thin line that fills over the step's duration (same as the desktop hero). */
function Progress({ state, idx, k }: { state: "todo" | "now" | "done"; idx: number; k: string }) {
  return (
    <div className="relative h-px w-full overflow-hidden bg-dark-grey">
      <motion.div
        key={k}
        className="absolute inset-0 origin-left bg-off-white"
        initial={{ scaleX: state === "done" ? 1 : 0 }}
        animate={{ scaleX: state === "todo" ? 0 : 1 }}
        transition={{ duration: state === "now" ? PHASE_S[idx as Phase] + 0.3 : 0.4, ease: state === "now" ? "linear" : "easeInOut" }}
      />
    </div>
  );
}

function Caption({ idx }: { idx: number }) {
  const s = STEPS[idx];
  return (
    <div className="flex flex-col gap-2 text-off-white">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm uppercase leading-none tracking-tight">{s.label}</p>
        <ActorTag actor={s.actor} label={s.who} />
      </div>
      <p className="text-xl leading-7">{s.title}</p>
    </div>
  );
}

const stateOf = (i: number, phase: number) => (i < phase ? "done" : i === phase ? "now" : "todo");

/* ── A · Tabs: three tabs with progress on top, one panel that cross-fades ── */

export function HeroTabs() {
  const ref = useRef<HTMLDivElement>(null);
  const { phase, cycle, go, reduce } = useHeroLoop(useInView(ref, { margin: "-10% 0px" }));
  return (
    <div ref={ref} className="flex w-full flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        {STEPS.map((s, i) => (
          <button key={s.label} onClick={() => go(i)} className="flex cursor-pointer flex-col gap-3 text-left">
            <span className={cn("font-mono text-xs uppercase leading-3 tracking-tight transition-colors duration-500", i === phase ? "text-off-white" : "text-off-white-light")}>{s.label}</span>
            <Progress state={stateOf(i, phase)} idx={i} k={`${cycle}-${i}-${i === phase}`} />
          </button>
        ))}
      </div>
      <div className="relative">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={`${phase}-${cycle}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}>
            <Panel idx={phase} mode={modeOf(phase, phase, reduce)} dim={false} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xl leading-7 text-off-white">{STEPS[phase].title}</p>
        <ActorTag actor={STEPS[phase].actor} label={STEPS[phase].who} className="text-off-white" />
      </div>
    </div>
  );
}

/* ── B · Slide: one frame, panels slide right → left; swipe to move; segmented progress ── */

export function HeroSlide() {
  const ref = useRef<HTMLDivElement>(null);
  const { phase, cycle, go, reduce } = useHeroLoop(useInView(ref, { margin: "-10% 0px" }));
  return (
    <div ref={ref} className="flex w-full flex-col gap-5">
      <div className="overflow-hidden">
        <motion.div
          className="flex touch-pan-y"
          animate={{ x: `${-phase * 100}%` }}
          transition={{ duration: 0.8, ease }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.25}
          onDragEnd={(_, info) => { if (info.offset.x < -40) go(phase + 1); else if (info.offset.x > 40) go(phase - 1); }}
        >
          {PANELS.map((_, i) => (
            <div key={i} className="w-full shrink-0">
              <Panel idx={i} mode={modeOf(i, phase, reduce)} dim={false} />
            </div>
          ))}
        </motion.div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {STEPS.map((s, i) => (
          <button key={s.label} aria-label={s.label} onClick={() => go(i)} className="cursor-pointer py-2">
            <Progress state={stateOf(i, phase)} idx={i} k={`${cycle}-${i}-${i === phase}`} />
          </button>
        ))}
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease }}>
          <Caption idx={phase} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── C · Peek: native swipe carousel, next card peeks in from the right; auto-advances ── */

export function HeroPeek() {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const { phase, cycle, go, reduce } = useHeroLoop(useInView(ref, { margin: "-10% 0px" }));
  const programmatic = useRef(false);

  // keep the active card in view as the loop advances
  useEffect(() => {
    const el = track.current, card = el?.children[phase] as HTMLElement | undefined;
    if (!el || !card) return;
    programmatic.current = true;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
    const t = setTimeout(() => { programmatic.current = false; }, 700);
    return () => clearTimeout(t);
  }, [phase, cycle]);

  // a swipe picks the card that snapped into place
  const onScrollEnd = () => {
    const el = track.current;
    if (!el || programmatic.current) return;
    const w = (el.children[0] as HTMLElement).offsetWidth + 16;
    const i = Math.round(el.scrollLeft / w);
    if (i !== phase) go(i);
  };

  return (
    <div ref={ref} className="flex w-full flex-col">
      <div
        ref={track}
        onScrollEnd={onScrollEnd}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {PANELS.map((_, i) => (
          <div key={i} className="flex w-[85%] shrink-0 snap-start flex-col gap-5">
            <Panel idx={i} mode={modeOf(i, phase, reduce)} />
            <Progress state={stateOf(i, phase)} idx={i} k={`${cycle}-${i}-${i === phase}`} />
            <div className={cn("transition-opacity duration-500", i === phase ? "opacity-100" : "opacity-50")}>
              <Caption idx={i} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

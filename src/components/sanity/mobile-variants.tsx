"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { ActorTag, type Actor } from "./actor";
import { LetterIcon, steps } from "./how-it-works";
import { examples } from "./examples";
import { RequestScene } from "./request-scenes";

/** Mobile directions for "How it works" (D/U/G/P) and "Ask for everyday work" (examples). Copy is V1. */

const ease = [0.65, 0, 0.35, 1] as const;
const who = (a: Actor, i: number) => (a === "ai" ? "AI" : i === 0 ? "You" : "Your team");
const tagTone = (a: Actor) => (a === "ai" ? "text-off-white-light" : "text-off-white");

/** Track the card that is snapped into view in a horizontal scroller. */
function useSnapIndex(n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const on = () => {
      const w = (el.children[0] as HTMLElement).offsetWidth + 16;
      setI(Math.max(0, Math.min(n - 1, Math.round(el.scrollLeft / w))));
    };
    el.addEventListener("scroll", on, { passive: true });
    return () => el.removeEventListener("scroll", on);
  }, [n]);
  return { ref, i };
}

function Segments({ n, i }: { n: number; i: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: n }, (_, k) => (
        <div key={k} className={cn("h-px flex-1 transition-colors duration-500", k <= i ? "bg-off-white" : "bg-dark-grey")} />
      ))}
    </div>
  );
}

const scroller = "-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/* ═══════════════ HOW IT WORKS (D/U/G/P) ═══════════════ */

/** H1 · Timeline — now the live mobile layout (see how-it-works.tsx). */
export { HowTimeline } from "./how-it-works";

/** H2 · 2 × 2 grid: four compact tiles, all steps visible at once. */
export function HowGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10">
      {steps.map((s, i) => (
        <div key={s.glyph} className="flex flex-col gap-4">
          <LetterIcon glyph={s.glyph} index={i + 1} actor={s.actor} />
          <ActorTag actor={s.actor} label={who(s.actor, i)} className={tagTone(s.actor)} />
          <p className="text-base leading-6 text-off-white">
            {s.title} <span className="text-off-white-light">{s.text}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

/** H3 · Swipe: one step per card, the next one peeks in; segments show where you are. */
export function HowSwipe() {
  const { ref, i } = useSnapIndex(steps.length);
  return (
    <div className="flex flex-col gap-6">
      <div ref={ref} className={scroller}>
        {steps.map((s, k) => (
          <div key={s.glyph} className="flex w-[78%] shrink-0 snap-start flex-col gap-8 border border-dark-grey p-6">
            <LetterIcon glyph={s.glyph} index={k + 1} actor={s.actor} />
            <div className="flex flex-col gap-3">
              <ActorTag actor={s.actor} label={who(s.actor, k)} className={tagTone(s.actor)} />
              <p className="text-xl leading-7 text-off-white">
                {s.title} <span className="text-off-white-light">{s.text}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <Segments n={steps.length} i={i} />
    </div>
  );
}

/* ═══════════════ ASK FOR EVERYDAY WORK (examples) ═══════════════ */

function Scene({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-25% 0px" });
  return (
    <div ref={ref} className="w-full">
      <RequestScene index={index} active={inView} />
    </div>
  );
}

const num = (i: number) => String(i + 1).padStart(2, "0");

/** E1 · Compact: the desktop order kept, but tight — label, illustration, then title and request close to it. */
export function ExamplesCompact() {
  return (
    <div className="flex flex-col gap-20">
      {examples.map((e, i) => (
        <div key={e.label} className="flex flex-col gap-6">
          <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">{num(i)} {e.label}</p>
          <Scene index={i} />
          <div className="flex flex-col gap-3">
            <p className="text-2xl text-off-white">{e.label}</p>
            <p className="text-base leading-6 text-off-white-light">{e.request}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** E2 · Swipe: the four requests as cards side by side; the illustration plays on the card in view. */
export function ExamplesSwipe() {
  const { ref, i } = useSnapIndex(examples.length);
  return (
    <div className="flex flex-col gap-6">
      <div ref={ref} className={scroller}>
        {examples.map((e, k) => (
          <div key={e.label} className="flex w-[86%] shrink-0 snap-start flex-col gap-6">
            <div className="w-full border border-dark-grey p-4">
              <RequestScene index={k} active={k === i} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">{num(k)}</p>
              <p className="text-2xl text-off-white">{e.label}</p>
              <p className="text-base leading-6 text-off-white-light">{e.request}</p>
            </div>
          </div>
        ))}
      </div>
      <Segments n={examples.length} i={i} />
    </div>
  );
}

/** E3 · Tabs: four numbered tabs, one illustration and request at a time; moves on by itself. */
export function ExamplesTabs() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20% 0px" });
  const [i, setI] = useState(0);
  const [k, setK] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => { setI((v) => (v + 1) % examples.length); setK((v) => v + 1); }, 7000);
    return () => clearTimeout(t);
  }, [i, k, inView]);
  const e = examples[i];
  return (
    <div ref={ref} className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-2">
        {examples.map((x, j) => (
          <button key={x.label} onClick={() => { setI(j); setK((v) => v + 1); }} className="flex cursor-pointer flex-col gap-3 text-left">
            <span className={cn("font-mono text-sm uppercase leading-none tracking-tight transition-colors", i === j ? "text-off-white" : "text-off-white-light")}>{num(j)}</span>
            <div className="relative h-px w-full overflow-hidden bg-dark-grey">
              <motion.div key={`${k}-${j}`} className="absolute inset-0 origin-left bg-off-white" initial={{ scaleX: j < i ? 1 : 0 }} animate={{ scaleX: j <= i ? 1 : 0 }} transition={{ duration: j === i ? 7 : 0.3, ease: "linear" }} />
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease }} className="flex flex-col gap-6">
          <RequestScene index={i} active={inView} />
          <div className="flex flex-col gap-3">
            <p className="text-2xl text-off-white">{e.label}</p>
            <p className="text-base leading-6 text-off-white-light">{e.request}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** E4 · Pinned: the label ("01 / 04"), and the illustration stay pinned and change; only the titles and requests scroll. */
export function ExamplesPinned() {
  const [i, setI] = useState(0);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  // the active example is the last one whose title has reached the lower quarter of the viewport
  useEffect(() => {
    const on = () => {
      const line = window.innerHeight * 0.75;
      let a = 0;
      items.current.forEach((el, k) => { if (el && el.getBoundingClientRect().top < line) a = k; });
      setI(a);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <div className="relative">
      <div className="sticky top-16 z-10 flex flex-col gap-4 bg-off-black pb-6 pt-4">
        <div className="flex items-center justify-between gap-4 font-mono text-sm uppercase leading-none tracking-tight">
          <div className="relative h-[14px] flex-1 overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.p key={i} className="absolute inset-0 truncate text-off-white" initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "-100%" }} transition={{ duration: 0.45, ease }}>
                {examples[i].label}
              </motion.p>
            </AnimatePresence>
          </div>
          <p className="shrink-0 text-off-white-light">
            <span className="text-off-white">{num(i)}</span> / {num(examples.length - 1)}
          </p>
        </div>
        <div className="grid">
          {examples.map((e, k) => (
            <motion.div key={e.label} className="col-start-1 row-start-1" initial={false} animate={{ opacity: k === i ? 1 : 0 }} transition={{ duration: 0.5, ease }}>
              <RequestScene index={k} active={k === i} />
            </motion.div>
          ))}
        </div>
        <div className="flex gap-2">
          {examples.map((e, k) => <div key={e.label} className={cn("h-px flex-1 transition-colors duration-500", k <= i ? "bg-off-white" : "bg-dark-grey")} />)}
        </div>
      </div>
      <div className="flex flex-col">
        {examples.map((e, k) => (
          <div
            key={e.label}
            ref={(el) => { items.current[k] = el; }}
            className={cn("flex flex-col gap-3 pt-4 transition-opacity duration-500", k === examples.length - 1 ? "min-h-[40vh]" : "min-h-[60vh]", k === i ? "opacity-100" : "opacity-30")}
          >
            <p className="text-2xl text-off-white">{e.label}</p>
            <p className="text-base leading-6 text-off-white-light">{e.request}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

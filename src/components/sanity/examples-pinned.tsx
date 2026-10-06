"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { examples } from "./examples-data";
import { RequestScene } from "./request-scenes";

const ease = [0.65, 0, 0.35, 1] as const;
const num = (i: number) => String(i + 1).padStart(2, "0");

/** E4 · Pinned: progress + counter ("01 / 04") and the illustration stay pinned and change; only the titles and requests scroll. */
/** `aspect(i)` = height / width of example i's illustration; the pinned box follows it (capped at 46% of the screen). */
export function ExamplesPinned({ aspect = () => 204 / 480, layout }: { aspect?: (i: number) => number; layout?: ("wide" | "narrow")[] } = {}) {
  const [i, setI] = useState(0);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const pin = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, max: 0 });
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const on = () => setSize({ w: el.offsetWidth, max: window.innerHeight * 0.46 });
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    window.addEventListener("resize", on);
    return () => { ro.disconnect(); window.removeEventListener("resize", on); };
  }, []);
  const height = size.w ? Math.min(size.w * aspect(i), size.max) : undefined;
  // the active example is the last one whose title has come up close under the pinned illustration
  useEffect(() => {
    const on = () => {
      const line = (pin.current?.getBoundingClientRect().bottom ?? 0) + 140;
      let a = 0;
      items.current.forEach((el, k) => { if (el && el.getBoundingClientRect().top < line) a = k; });
      // the last one can't climb that far: activate it once the whole list has scrolled into view
      const last = items.current[items.current.length - 1];
      if (last && last.getBoundingClientRect().bottom < window.innerHeight - 40) a = items.current.length - 1;
      setI(a);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return (
    <div className="relative">
      <div ref={pin} className="sticky top-[72px] z-10 flex flex-col gap-5 bg-off-black pb-6 pt-4">
        {/* four steps + counter on top, the illustration below */}
        <div className="flex items-center gap-4">
          <div className="flex flex-1 gap-2">
            {examples.map((e, k) => <div key={e.label} className={cn("h-px flex-1 transition-colors duration-500", k <= i ? "bg-off-white" : "bg-dark-grey")} />)}
          </div>
          <p className="shrink-0 font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">
            <span className="text-off-white">{num(i)}</span> / {num(examples.length - 1)}
          </p>
        </div>
        <div ref={boxRef} className="relative w-full transition-[height] duration-500 ease-in-out" style={height ? { height } : { aspectRatio: `1 / ${aspect(0)}` }}>
          {examples.map((e, k) => (
            <motion.div key={e.label} className="absolute inset-0" initial={false} animate={{ opacity: k === i ? 1 : 0 }} transition={{ duration: 0.5, ease }}>
              <RequestScene index={k} active={k === i} fit scope="p" layout={layout?.[k]} />
            </motion.div>
          ))}
        </div>
        {/* text scrolling up fades out under the pinned block instead of being cut */}
        <div className="pointer-events-none absolute inset-x-0 top-full h-20 bg-gradient-to-b from-off-black to-transparent" />
      </div>
      <div className="flex flex-col gap-16 pt-4">
        {examples.map((e, k) => (
          <div
            key={e.label}
            ref={(el) => { items.current[k] = el; }}
            className={cn("flex flex-col gap-3 transition-opacity duration-500", k === i ? "opacity-100" : "opacity-30")}
          >
            <p className="text-2xl text-off-white">{e.label}</p>
            <p className="text-base leading-6 text-off-white-light">{e.request}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

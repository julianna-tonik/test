"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { ScrollText, SectionLabel } from "./shared";
import { RequestScene } from "./request-scenes";

const examples = [
  {
    label: "NYC Security Summit",
    request:
      "“We're hosting the NYC Security Summit for enterprise security teams. Create the event page, feature this year's speakers and our strongest security customer proof, and save it as a draft.”",
  },
  {
    label: "AI Governance Report",
    request:
      "“Create a landing page for our new AI governance report. Lead with the most important findings, include the strongest customer proof, collect work emails before download, and send me a staging preview.”",
  },
  {
    label: "Homepage Campaign",
    request:
      "“Update the homepage for the security campaign. Replace the hero headline, move customer logos above the product tour, and swap in the Acme quote. Keep navigation and legal copy unchanged.”",
  },
  {
    label: "Event Conversion",
    request:
      "“Keep the current event page as variant A. Create variant B with the new headline and registration CTA, then start a 50/50 PostHog test using completed registrations as the conversion.”",
  },
];

const progressValues: Record<number, number> = { [-1]: 0, 0: 0.11, 1: 0.37, 2: 0.63, 3: 0.89, 4: 1 };

export function SanityExamples() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const n = examples.length;
    setActive(p <= 0 ? -1 : p >= 1 ? n : Math.min(Math.floor(p * n), n - 1));
  });

  const scrollTo = (i: number) => {
    const s = sectionRefs.current[i], side = sidebarRef.current;
    if (!s || !side) return;
    window.scrollTo({ top: window.scrollY + s.getBoundingClientRect().top - side.getBoundingClientRect().top, behavior: "smooth" });
  };

  return (
    <section className="flex w-full max-w-container-6xl flex-col gap-[100px] pb-[120px]">
      <SectionLabel>Example requests</SectionLabel>
      <ScrollText text="Ask for everyday work. Get a controlled result." className="py-[50px]" />

      <div className="flex flex-col gap-10 md:flex-row">
        {/* Sticky sidebar — Vibe Fixer pattern */}
        <div ref={sidebarRef} className="sticky top-[calc(50%-40px)] hidden h-fit flex-col gap-2 self-start px-6 md:flex">
          <div className="relative flex flex-col gap-2">
            <div className="absolute left-0.5 top-0 h-full w-px bg-dark-grey">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: progressValues[active] }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 top-0 h-full w-full origin-top bg-off-white"
              />
            </div>
            {examples.map((e, i) => (
              <button key={e.label} onClick={() => scrollTo(i)} className="z-10 grid cursor-pointer grid-cols-[48px_auto] items-center text-left">
                <div className={cn("size-[5px] border border-dark-grey bg-off-black transition-all", { "border-off-white": i <= active })} />
                <p className={cn("col-start-2 font-mono text-sm uppercase leading-none tracking-tight transition-colors duration-300", i === active ? "text-off-white" : "text-off-white-light")}>
                  {String(i + 1).padStart(2, "0")} {e.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div ref={containerRef} className="flex flex-1 flex-col gap-20 md:gap-40">
          {examples.map((e, i) => (
            <div
              key={e.label}
              ref={(el) => { sectionRefs.current[i] = el; }}
              className={cn("flex flex-col gap-10 transition-opacity duration-700 md:gap-20", active === i || active === -1 && i === 0 ? "opacity-100" : "opacity-100 md:opacity-40")}
            >
              {/* Vibe Fixer "What you get" anatomy: illustration full width, text centred below */}
              <div className="flex w-full items-center">
                <RequestScene index={i} active={active === i} />
              </div>
              <div className="flex justify-center">
                <div className="flex max-w-lg flex-col gap-10">
                  <p className="text-2xl text-off-white md:text-3xl">{e.label}</p>
                  <p className="text-base leading-6 text-off-white-light">{e.request}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

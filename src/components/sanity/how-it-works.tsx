"use client";

import { Separator } from "@/components/ui/separator";
import { Reveal, ScrollText, SectionLabel } from "./shared";

/** Letter icon in the Vibe Fixer F/T/S style: glyph in square + circle, corner index. */
function LetterIcon({ glyph, index }: { glyph: string; index: number }) {
  return (
    <svg viewBox="0 0 57.13 57.13" fill="none" className="size-[57px]">
      <rect x=".25" y=".25" width="56.63" height="56.63" stroke="#666" strokeWidth=".5" />
      <circle cx="28.56" cy="28.56" r="20.64" stroke="#666" strokeWidth=".5" />
      <text x="28.56" y="36.2" textAnchor="middle" fill="#fff" fontSize="22" style={{ fontFamily: "var(--font-sans)" }}>
        {glyph}
      </text>
      <rect x=".25" y="43.16" width="13.72" height="13.72" stroke="#666" strokeWidth=".5" />
      <text x="7.1" y="52.5" textAnchor="middle" fill="#fff" fontSize="7" style={{ fontFamily: "var(--font-mono)" }}>
        {index}
      </text>
    </svg>
  );
}

const steps = [
  { glyph: "D", title: "Describe what you need.", text: "Share the launch, audience, and goal." },
  { glyph: "U", title: "Use what already works.", text: "The draft uses approved sections and existing content." },
  { glyph: "G", title: "Get a real draft.", text: "Review the page in Sanity and on staging." },
  { glyph: "P", title: "Publish when ready.", text: "Your team edits, approves, and publishes as usual." },
];

export function SanityHowItWorks() {
  return (
    <section className="z-10 flex w-full max-w-container-6xl flex-col pb-20 md:pb-40">
      <SectionLabel>How it works</SectionLabel>

      <ScrollText text="Ask for a page. Get a draft that already fits your website." />

      <div className="grid w-full grid-cols-1 gap-10 md:grid-cols-2">
        {["AI builds", "Your team decides"].map((label, i) => (
          <div key={label} className="flex flex-col gap-3">
            <Separator />
            <div className="flex justify-between font-mono text-sm uppercase leading-none tracking-tight">
              <span className="text-off-white">{label}</span>
              <span className="text-[#555]">{i === 0 ? "01 — 02" : "03 — 04"}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-10 pt-14 sm:grid-cols-2 md:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.glyph} delay={i * 0.08} className="flex flex-col gap-8">
            <LetterIcon glyph={s.glyph} index={i + 1} />
            <p className="text-xl leading-7 text-off-white">
              <span>{s.title}</span> <span className="text-off-white-light">{s.text}</span>
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal className="pt-[72px]">
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">
          {"/*"} Sanity stays the source of truth. Your existing rules stay in place. {"*/"}
        </p>
      </Reveal>
    </section>
  );
}

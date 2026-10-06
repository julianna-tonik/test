"use client";

import { Reveal, ScrollText, SectionLabel } from "./shared";
import { Actor, ActorTag } from "./actor";
import { cn } from "@/lib/utils";

/** Letters drawn as thin strokes, like the F/T/S glyphs in Vibe Fixer (not a font). */
const GLYPHS: Record<string, string> = {
  D: "M24.2 20.4V37.2h4.3c4.1 0 6.4-3.1 6.4-8.4s-2.3-8.4-6.4-8.4z",
  U: "M23.6 20.4v11.4c0 3.5 1.9 5.5 5 5.5s5-2 5-5.5V20.4",
  G: "M33.9 24.3c-.8-2.6-2.7-4.1-5.3-4.1-3.6 0-5.7 3.3-5.7 8.6s2.1 8.6 5.7 8.6c3.4 0 5.5-2.5 5.5-6.4v-.9h-5.4",
  P: "M24.6 37.9V20.4h5c2.9 0 4.6 1.8 4.6 4.7s-1.7 4.7-4.6 4.7h-5",
};

/**
 * Letter icon in the Vibe Fixer F/T/S style: glyph in square + circle, corner index.
 * The circle carries the actor: solid = a person, dashed = AI.
 */
function LetterIcon({ glyph, index, actor }: { glyph: string; index: number; actor: Actor }) {
  return (
    <svg aria-hidden viewBox="0 0 57.13 57.13" fill="none" className="size-[57px]">
      <rect x=".25" y=".25" width="56.63" height="56.63" stroke="#666" strokeWidth=".5" />
      {actor === "human" ? (
        <circle cx="28.56" cy="28.56" r="20.64" stroke="#efefef" strokeWidth=".75" />
      ) : (
        <circle cx="28.56" cy="28.56" r="20.64" stroke="#888" strokeWidth=".75" strokeDasharray="2 2.4" />
      )}
      <path d={GLYPHS[glyph]} stroke="#fff" strokeWidth="1.35" />
      <rect x=".25" y="43.16" width="13.72" height="13.72" stroke="#666" strokeWidth=".5" />
      <text x="7.1" y="53.5" textAnchor="middle" fill="#fff" fontSize="9.6" style={{ fontFamily: "var(--font-sans)" }}>
        {index}
      </text>
    </svg>
  );
}

const steps: { glyph: string; title: string; text: string; actor: Actor }[] = [
  { glyph: "D", title: "Describe what you need.", text: "Share the launch, audience, and goal.", actor: "human" },
  { glyph: "U", title: "Use what already works.", text: "The draft uses approved sections and existing content.", actor: "ai" },
  { glyph: "G", title: "Get a real draft.", text: "Review the page in Sanity and on staging.", actor: "human" },
  { glyph: "P", title: "Publish when ready.", text: "Your team edits, approves, and publishes as usual.", actor: "human" },
];

/** Who-does-what bar sitting exactly above the four columns: solid line = person, dashed = AI. */
const lanes: { label: string; actor: Actor; span: string }[] = [
  { label: "You", actor: "human", span: "md:col-span-1" },
  { label: "AI", actor: "ai", span: "md:col-span-1" },
  { label: "Your team", actor: "human", span: "md:col-span-2" },
];

export function SanityHowItWorks() {
  return (
    <section className="z-10 flex w-full max-w-container-6xl flex-col pb-20 md:pb-40">
      <SectionLabel>How it works</SectionLabel>

      <ScrollText text="Ask for a page. Get a draft that already fits your website." />

      <div className="hidden w-full grid-cols-4 gap-10 md:grid">
        {lanes.map((l) => (
          <div key={l.label} className={cn("flex flex-col gap-3", l.span)}>
            {l.actor === "human" ? (
              <div className="h-px w-full bg-off-white" />
            ) : (
              <div className="h-px w-full bg-[length:6px_1px] bg-repeat-x" style={{ backgroundImage: "linear-gradient(90deg,#888 0 3px,transparent 3px 6px)" }} />
            )}
            <ActorTag actor={l.actor} label={l.label} className={l.actor === "human" ? "text-off-white" : "text-off-white-light"} />
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-10 pt-14 sm:grid-cols-2 md:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.glyph} delay={i * 0.08} className="flex flex-col gap-8">
            <LetterIcon glyph={s.glyph} index={i + 1} actor={s.actor} />
            <ActorTag
              actor={s.actor}
              label={s.actor === "ai" ? "AI" : i === 0 ? "You" : "Your team"}
              className={cn("-mt-4 md:hidden", s.actor === "ai" ? "text-off-white-light" : "text-off-white")}
            />
            <p className="text-xl leading-7 text-off-white">
              <span>{s.title}</span> <span className="text-off-white-light">{s.text}</span>
            </p>
          </Reveal>
        ))}
      </div>

      <Reveal className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-[72px]">
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light">
          {"/*"} Sanity stays the source of truth. Your existing rules stay in place. {"*/"}
        </p>
        <span className="flex items-center gap-6 text-off-white-light">
          <ActorTag actor="human" label="Person" />
          <ActorTag actor="ai" label="AI" />
        </span>
      </Reveal>
    </section>
  );
}

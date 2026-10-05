"use client";

import { Fragment, ReactNode, useMemo, useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { ContactUsLink } from "@/components/contact-us-button";
import { cn } from "@/lib/utils";

export const SANITY_BOOK_CALL_HREF = "/sanity-book-call";

export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Vibe Fixer "Book a call" button, pointed at the Sanity booking route. */
export function SanityBookCall({
  children = "Book a call",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <ContactUsLink className={className} href={SANITY_BOOK_CALL_HREF}>
      {children}
    </ContactUsLink>
  );
}

/** Section opener used across Vibe Fixer: hairline + mono label (label slides up from a mask). */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Separator />
      <div className="overflow-hidden">
        <motion.p
          initial={{ y: "100%" }}
          whileInView={{ y: "0%" }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="font-mono text-sm uppercase leading-none tracking-tight text-off-white"
        >
          {children}
        </motion.p>
      </div>
    </div>
  );
}

/** Fade-up used for content blocks. */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Word({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = index / total;
  const color = useTransform(
    progress,
    [start, start + 1 / total],
    ["rgb(136, 136, 136)", "rgb(230, 230, 230)"],
  );
  return (
    <motion.span style={{ color }} className="inline-block">
      {children}
    </motion.span>
  );
}

/** Vibe Fixer manifesto: words light up as the line crosses the viewport. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const words = useMemo(() => text.split(" "), [text]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["center 0.8", "center 0.2"] });

  return (
    <div ref={ref} className={cn("flex w-full py-[150px]", className)}>
      <p className="w-full text-center text-3xl @md:text-4xl @xl:text-5xl leading-snug text-balance">
        {words.map((word, i) => (
          <Fragment key={i}>
            <Word progress={scrollYProgress} index={i} total={words.length}>
              {word}
            </Word>
            {i < words.length - 1 && " "}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

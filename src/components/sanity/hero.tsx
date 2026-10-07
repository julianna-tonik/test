"use client";

import { motion } from "motion/react";
import { Logo } from "@/components/ui/logo";
import { Ticker } from "@/components/ui/ticker";
import { useHeroScroll } from "@/components/sections/hero-scroll-context";
import { ProductFragments } from "./product-fragments";
import { HeroSlide } from "./hero-mobile";
import { SanityBookCall, SectionLabel, easeOut } from "./shared";
import { SanityStickyHeader } from "./sticky-header";

const line = {
  hidden: { y: "105%" },
  visible: (i: number) => ({ y: "0%", transition: { duration: 1, ease: [0.65, 0, 0.35, 1] as const, delay: 0.1 + i * 0.1 } }),
};

export function SanityHero() {
  const { heroRef } = useHeroScroll();

  return (
    <section
      ref={heroRef}
      className="relative flex w-full max-w-container-6xl flex-col gap-10 pb-6 pt-14 font-sans text-off-white lg:pt-0"
    >
      <header className="z-10 hidden w-full items-start justify-between lg:flex">
        <a href="https://www.tonik.com/">
          <Logo className="size-10 shrink-0 overflow-clip" />
        </a>
        <SanityBookCall />
      </header>

      <div className="relative flex w-full flex-col gap-12 pb-4 pt-10 sm:gap-24 md:pb-28">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <h1 className="text-4xl leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            {["Move fast.", "Stay in control."].map((t, i) => (
              <span key={t} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" variants={line} initial="hidden" animate="visible" custom={i}>
                  {t}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOut, delay: 0.35 }}
            className="flex w-full max-w-[400px] flex-col gap-5"
          >
            <p className="text-base leading-6">
              We build Sanity websites your marketing team can update by describing what they need.
              Every page still follows your brand and publishing process.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <SanityBookCall />
              <p className="font-mono text-xs uppercase leading-3 tracking-tight text-off-white-light">
                {"/*"} Sanity + your content + control {"*/"}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.5 }}
        >
          {/* phones: one frame that slides Ask → Build → Review; md+: the three panels side by side */}
          <div className="md:hidden">
            <HeroSlide />
          </div>
          <div className="hidden md:block">
            <ProductFragments />
          </div>
        </motion.div>
      </div>

      {/* logos get their own label, Vibe Fixer style, so the next section label never reads as their caption */}
      <div className="flex w-full flex-col gap-6">
        <SectionLabel>Trusted by teams at</SectionLabel>
        {/* phones: logos a third closer together so more of them show at once */}
        <div className="w-full md:hidden">
          <Ticker gap={7} />
        </div>
        <div className="hidden w-full md:block">
          <Ticker />
        </div>
      </div>
      <SanityStickyHeader />
    </section>
  );
}

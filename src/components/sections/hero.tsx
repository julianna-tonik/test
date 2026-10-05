"use client";

import { Logo } from "@/components/ui/logo";
import { BookCallLink } from "../contact-us-button";
import { Ticker } from "../ui/ticker";
import Image from "next/image";
import heroBlocks from "@/assets/blocks-hero.svg";
import { cn } from "@/lib/utils";
import { StickyHeader } from "../sticky-header";
import { useHeroScroll } from "./hero-scroll-context";

export function HeroSection() {
  const { heroRef } = useHeroScroll();

  return (
    <section
      ref={heroRef}
      className="relative flex w-full flex-col gap-10 pb-6 text-off-white font-sans max-w-container-6xl pt-14 lg:pt-0"
    >
      {/* Header - hidden on mobile/tablet where sticky header is always visible */}
      <header className="hidden lg:flex w-full items-start justify-between z-10">
        <a href="https://www.tonik.com/">
          <Logo className="size-10 shrink-0 overflow-clip" />
        </a>
        <BookCallLink className={cn("opacity-0")}>Book a call</BookCallLink>
      </header>

      {/* Content Section */}
      <div className="flex w-full flex-col gap-12 sm:gap-24 pt-10 pb-4 md:pb-28 relative">
        {/* Intro Section */}
        <div className="relative inline-grid shrink-0 z-10">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight">
            From vibe coded MVP
            <br />
            to scalable product
          </h1>
        </div>

        {/* Problem Section */}
        <div className="flex max-w-xl w-full flex-col items-start justify-center gap-10 z-10">
          <div className="w-full @container max-w-lg">
            <p className="mb-4">
              <span className="whitespace-pre">
                You shipped your MVP in record time.
              </span>{" "}
              <span className="whitespace-pre">
                Now every change is a new fire.{" "}
                <span className="grayscale-100">🔥</span>
              </span>{" "}
            </p>
            <p className="mb-4 text-base">
              <span className="whitespace-pre">
                We stabilize and structure your MVP without
              </span>{" "}
              <span className="whitespace-pre">starting from scratch,</span> so
              you can keep shipping fast instead of fighting fires.
            </p>
            <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white-light hidden @sm:block">
              {"/*"} ARCHITECTURE, TESTS, SECURITY, AI-SETUP {"*/"}
            </p>
            <p className="font-mono text-sm uppercase text-off-white-light @sm:hidden whitespace-pre">
              {"/**"}
              <br />
              {" *"} ARCHITECTURE <br />
              {" *"} TESTS <br />
              {" *"} SECURITY <br />
              {" *"} AI-SETUP <br />
              {" */"}
            </p>
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-20 lg:flex justify-end hidden">
          <BookCallLink className="absolute top-1/2 right-[103px] translate-y-[-19px] min-w-[200px] z-10">
            Book a triage call
          </BookCallLink>
          <Image src={heroBlocks} alt="" className="opacity-50" />
        </div>
      </div>

      <Ticker />

      {/* Sticky header with sentinel */}
      <StickyHeader />
    </section>
  );
}

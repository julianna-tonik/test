"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import { Logo } from "@/components/ui/logo";
import { BookCallLink } from "./contact-us-button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function StickyHeader() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Track scroll progress relative to the sentinel
  // Progress goes from 0 (sentinel at bottom of viewport) to 1 (sentinel at top of viewport)
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    offset: ["start end", "start start"],
  });

  // Track when we've scrolled past the sentinel (it's above the viewport)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsSticky(latest >= 1);
  });

  // Slide down animation: starts at -100% (hidden above), ends at 0% (visible)
  // Animates during the last 10% of scroll progress before sentinel exits viewport
  const y = useTransform(scrollYProgress, [0.9, 1], ["-100%", "0%"]);

  return (
    <>
      {/* Sentinel element - placed at the end of hero section area */}
      <div ref={sentinelRef} className="absolute bottom-0 left-0 h-px w-full" />

      {/* Mobile sticky header - always visible on screens < lg */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-off-black lg:hidden transition-[border-color] duration-300",
          isSticky
            ? "border-b border-dark-grey/50"
            : "border-b border-transparent",
        )}
      >
        <a href="https://www.tonik.com/">
          <Logo className="size-10 shrink-0 overflow-clip" />
        </a>
        <BookCallLink>Book a call</BookCallLink>
      </header>

      {/* Desktop sticky header - slides down after scrolling past hero on lg+ */}
      <motion.header
        style={{ y }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden lg:block px-6 py-4 bg-off-black transition-[border-color] duration-300",
          isSticky
            ? "border-b border-dark-grey/50"
            : "border-b border-transparent",
        )}
      >
        <div className="flex w-full max-w-container-6xl mx-auto items-center justify-between">
          <a href="https://www.tonik.com/">
            <Logo className="size-10 shrink-0 overflow-clip" />
          </a>
          <BookCallLink>Book a call</BookCallLink>
        </div>
      </motion.header>
    </>
  );
}

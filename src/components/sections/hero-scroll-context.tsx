"use client";

import { createContext, useContext, useRef, RefObject } from "react";
import { useScroll, MotionValue } from "motion/react";

type HeroScrollContextType = {
  heroRef: RefObject<HTMLElement | null>;
  scrollYProgress: MotionValue<number>;
};

const HeroScrollContext = createContext<HeroScrollContextType | null>(null);

export function HeroScrollProvider({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  return (
    <HeroScrollContext.Provider value={{ heroRef, scrollYProgress }}>
      {children}
    </HeroScrollContext.Provider>
  );
}

export function useHeroScroll() {
  const context = useContext(HeroScrollContext);
  if (!context) {
    throw new Error("useHeroScroll must be used within HeroScrollProvider");
  }
  return context;
}

"use client";

import { Separator } from "@/components/ui/separator";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useTransform,
  MotionValue,
} from "motion/react";
import {
  Fragment,
  useRef,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

interface BenefitDetailProps {
  children?: ReactNode;
}

function BenefitDetail({ children }: BenefitDetailProps) {
  return (
    <div className="flex w-full items-start gap-4 relative group">
      <div className="absolute left-3 top-px h-[calc(100%+var(--spacing)*3)] w-0 group-last:hidden">
        <svg className="h-full w-px" preserveAspectRatio="none">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="100%"
            stroke="#888888"
            strokeWidth="1"
          />
        </svg>
      </div>
      <div className="z-10 flex size-6 shrink-0 items-center justify-center border border-off-white-light bg-off-black">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <path
            d="M2.8 7L5.6 9.8L11.2 4.2"
            stroke="#888888"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-base leading-6 text-off-white">{children}</p>
    </div>
  );
}

type BenefitId = "codebase" | "performance" | "ai" | "design";

interface BenefitData {
  id: BenefitId;
  label: ReactNode;
  title: ReactNode;
  details: ReactNode[];
  videoSrc: string;
  videoClassName?: string;
}

interface WordProps {
  children: string;
  scrollProgress: MotionValue<number>;
  index: number;
  totalWords: number;
}

function Word({ children, scrollProgress, index, totalWords }: WordProps) {
  const start = index / totalWords;
  const end = start + 1 / totalWords;

  const color = useTransform(
    scrollProgress,
    [start, end],
    ["rgb(136, 136, 136)", "rgb(230, 230, 230)"], // off-white-light to off-white
  );

  return (
    <motion.span style={{ color }} className="inline-block">
      {children}
    </motion.span>
  );
}

// Extracted IntroText component
interface IntroTextProps {
  text: string;
}

function IntroText({ text }: IntroTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const words = useMemo(() => text.split(" "), [text]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["center 0.8", "center 0.2"],
  });

  return (
    <div ref={ref} className="flex w-full flex-col gap-[140px] py-[150px]">
      <motion.p className="w-full text-center text-3xl @md:text-4xl @xl:text-5xl leading-snug">
        {words.map((word, index) => (
          <Fragment key={index}>
            <Word
              scrollProgress={scrollYProgress}
              index={index}
              totalWords={words.length}
            >
              {word}
            </Word>
            {index < words.length - 1 && " "}
          </Fragment>
        ))}
      </motion.p>
    </div>
  );
}

// Extracted BenefitSection component
interface BenefitSectionProps {
  benefit: BenefitData;
  registerRef: (el: HTMLDivElement | null) => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}

function BenefitSection({
  benefit,
  registerRef,
  videoRef,
}: BenefitSectionProps) {
  return (
    <div
      ref={registerRef}
      className="flex flex-col gap-10 md:gap-20"
    >
      <div className="flex h-auto w-full items-center justify-start">
        <video
          ref={videoRef}
          src={benefit.videoSrc}
          muted
          playsInline
          preload="metadata"
          className={benefit.videoClassName ?? "w-full h-full object-contain"}
        />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col gap-10 max-w-lg">
          <p className="text-2xl md:text-3xl text-off-white max-w-lg text-balance">
            {benefit.title}
          </p>
          <div className="relative flex w-full flex-col gap-3">
            {benefit.details.map((detail, i) => (
              <BenefitDetail key={i}>{detail}</BenefitDetail>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const benefitsData: BenefitData[] = [
  {
    id: "codebase",
    label: "Clean Up Codebase",
    videoSrc: "/steps/VC-1.mp4",
    videoClassName: "w-full h-full object-contain",
    title: <>Stabilize the Foundation</>,
    details: [
      "Refactor fragile logic and untangle messy areas",
      "Establish clear project structure & folder conventions",
      "Remove dead code, duplication, and unused dependencies",
      "Set up essential tooling (CI, linting, formatting, scripts)",
    ],
  },
  {
    id: "performance",
    label: "Audit Performance",
    videoSrc: "/steps/VC-2.mp4",
    videoClassName: "object-cover w-full h-auto lg:object-contain object-top",
    title: "Improve Performance & Reliability",
    details: [
      "Add monitoring, error tracking, and log visibility",
      "Optimize API calls, bundle size, and load performance",
      "Improve test coverage & add missing integration tests",
      "Fix regressions and harden critical paths",
    ],
  },
  {
    id: "ai",
    label: "Future-Proof AI",
    videoSrc: "/steps/VC-3.mp4",
    videoClassName: "object-cover w-full h-auto lg:object-contain object-top",
    title: "AI Future-Proofing",
    details: [
      "Standardize patterns so AI tools generate consistent code",
      "Structure the repo for safe LLM interactions",
      "Add semantic naming & documentation for AI agents",
      "Integrate lightweight AI-driven workflows where useful",
    ],
  },
  {
    id: "design",
    label: "Standardize Design",
    videoSrc: "/steps/VC-4.mp4",
    videoClassName: "object-cover w-full h-auto lg:object-contain object-top",
    title: "UX/UI and Design System",
    details: [
      "Clean and unify component structure across the app",
      "Fix UX inconsistencies and eliminate visual drift",
      "Align UI with a minimal design system & naming rules",
      "Improve responsiveness, accessibility, and layout logic",
    ],
  },
];

export function WhatYouGetSection() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // activeIndex: -1 = before first, 0-3 = sections, 4 = after last
  const [activeIndex, setActiveIndex] = useState(-1);

  // Track scroll position to determine active index
  // 6 states: -1 (before first), 0, 1, 2, 3 (sections), 4 (after last)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const numSections = benefitsData.length;
    let newActiveIndex: number;
    
    if (latest <= 0) {
      // Before first section
      newActiveIndex = -1;
    } else if (latest >= 1) {
      // After last section
      newActiveIndex = numSections;
    } else {
      // Map progress to section index (0 to numSections-1)
      const sectionIndex = Math.floor(latest * numSections);
      newActiveIndex = Math.min(sectionIndex, numSections - 1);
    }

    // Play video when section becomes active
    if (newActiveIndex !== activeIndex && newActiveIndex >= 0 && newActiveIndex < numSections) {
      const video = videoRefs.current[newActiveIndex];
      if (video && video.paused) {
        video.play();
      }
    }

    setActiveIndex(newActiveIndex);
  });

  // Progress values for 6 states: before(-1), 0, 1, 2, 3, after(4)
  // Maps activeIndex to visual progress of the line
  const progressValues: Record<number, number> = {
    [-1]: 0,      // before first
    0: 0.11,      // first section
    1: 0.33,      // second section
    2: 0.60,      // third section
    3: 0.88,      // fourth section (last)
    4: 1,         // after last
  };

  const handleScrollTo = (index: number) => {
    const section = sectionRefs.current[index];
    const sidebar = sidebarRef.current;

    if (section && sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();

      // Calculate scroll position to align section top with sidebar top
      const scrollTarget = window.scrollY + sectionRect.top - sidebarRect.top;

      window.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    }
  };

  const introText =
    "We stabilize your code, and clean the chaos, so your product can finally move fast again.";

  return (
    <section className="flex w-full flex-col gap-[100px] max-w-container-6xl pb-[120px]">
      {/* Header */}
      <div className="flex w-full flex-col gap-3">
        <Separator />
        <p className="font-mono text-sm uppercase leading-none tracking-tight text-off-white">
          Product You’re Not Afraid to Ship
        </p>
      </div>

      {/* Intro Text */}
      <IntroText text={introText} />

      {/* Benefits Container */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Sidebar - sticky, hidden on mobile */}
        <div
          ref={sidebarRef}
          className="hidden md:flex sticky top-[calc(50%-40px)] h-fit self-start flex-col gap-2 px-6"
        >
          <div className="flex flex-col relative gap-2">
            <div className="w-px h-full absolute top-0 left-0.5 bg-dark-grey">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: progressValues[activeIndex] }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-off-white h-full absolute top-0 left-0 w-full origin-top"
              />
            </div>
            {benefitsData.map((benefit, index) => (
              <button
                key={benefit.id}
                onClick={() => handleScrollTo(index)}
                className="grid grid-cols-[48px_auto] items-center z-10 cursor-pointer text-left"
              >
                <motion.div
                  className={cn(
                    "size-[5px] border border-dark-grey transition-all bg-off-black",
                    {
                      "border-off-white": index <= activeIndex,
                    },
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                />
                <p
                  className={cn(
                    "font-mono text-sm uppercase leading-none tracking-tight transition-colors duration-300 col-start-2",
                    index === activeIndex
                      ? "text-off-white"
                      : "text-off-white-light",
                  )}
                >
                  {benefit.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Content - all 4 sections rendered */}
        <div ref={containerRef} className="flex flex-1 flex-col gap-20 md:gap-40">
          {benefitsData.map((benefit, index) => (
            <BenefitSection
              key={benefit.id}
              benefit={benefit}
              registerRef={(el) => {
                sectionRefs.current[index] = el;
              }}
              videoRef={(el) => {
                videoRefs.current[index] = el;
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

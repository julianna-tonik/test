"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValueEvent } from "motion/react";
import { Separator } from "@/components/ui/separator";
import { useHeroScroll } from "./hero-scroll-context";
import fIcon from "@/assets/f1.svg";
import sIcon from "@/assets/s3.svg";
import tIcon from "@/assets/t2.svg";

const textVariants = {
  visible: { y: "0%" },
  hidden: { y: "-100%" },
};

const swappedTextVariants = {
  visible: { y: "0%" },
  hidden: { y: "100%" },
};

const transition = { duration: 0.3, ease: "easeInOut" as const };

export function AudienceSection() {
  const { scrollYProgress } = useHeroScroll();
  const [isSwapped, setIsSwapped] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setIsSwapped(latest >= 0.5);
  });

  const audiences = [
    {
      icon: <Image src={fIcon} alt="" />,
      title: "Founders",
      description:
        "who hacked together their MVP or PoC and now face tech or design debt.",
    },
    {
      icon: <Image src={tIcon} alt="" />,
      title: "Teams",
      description:
        "that want to bring back delivery speed while maintaining good product quality.",
    },
    {
      icon: <Image src={sIcon} alt="" />,
      title: "Startups",
      description:
        "that are trying to standardize\nAI workflow across the team to keep momentum.",
    },
  ];

  return (
    <section className="flex w-full flex-col gap-20 md:gap-32 pb-20 md:pb-40 max-w-container-6xl z-10">
      {/* Header */}
      <div className="flex w-full flex-col gap-3">
        <Separator />
        <div className="overflow-hidden relative">
          {/* Invisible spacer to define container height based on longer text */}
          <p
            className="invisible font-mono text-sm uppercase leading-none tracking-tight"
            aria-hidden="true"
          >
            Trusted by 200+ YCombinator & Speedrun founders
          </p>
          <motion.p
            initial="visible"
            variants={textVariants}
            animate={isSwapped ? "hidden" : "visible"}
            transition={transition}
            className="font-mono text-sm uppercase leading-none tracking-tight text-off-white absolute inset-0"
          >
            Trusted by 200+ YCombinator & Speedrun founders
          </motion.p>
          <motion.p
            initial="hidden"
            variants={swappedTextVariants}
            animate={isSwapped ? "visible" : "hidden"}
            transition={transition}
            className="font-mono text-sm uppercase leading-none tracking-tight text-off-white absolute inset-0"
          >
            For founders that move fast
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-10">
        {audiences.map((audience, i) => (
          <div key={i} className="flex flex-1 flex-col gap-6">
            <div className="flex size-16 shrink-0 items-center justify-center">
              <p className="text-xl leading-7 text-off-white">
                {audience.icon}
              </p>
            </div>
            <p className="text-xl leading-7 text-off-white">
              <span>{audience.title}</span>{" "}
              <span className="text-off-white-light">
                {audience.description}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

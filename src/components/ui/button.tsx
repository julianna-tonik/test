"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "motion/react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

function IconArrowRight({ className, ...rest }: { className?: string }) {
  return (
    <motion.svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...rest}
    >
      <motion.path
        variants={{
          normal: {
            x: 0,
          },
          hovered: {
            x: 100,
            transition: {
              repeat: Infinity,
              repeatDelay: 0.3,
              type: "tween",
              ease: "circInOut",
              duration: 0.3,
            }
          },
        }}
        d="M1.5 6H10.5M10.5 6L6 1.5M10.5 6L6 10.5"
        className="stroke-off-white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        variants={{
          normal: {
            x: -100,
          },
          hovered: {
            x: 0,
            transition: {
              repeat: Infinity,
              repeatDelay: 0.3,
              type: "tween",
              ease: "circInOut",
              duration: 0.3,
            }
          },
        }}
        d="M1.5 6H10.5M10.5 6L6 1.5M10.5 6L6 10.5"
        className="stroke-off-white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

export function Button({ children, className, href, ...rest }: ButtonProps) {
  const baseClasses =
    "group relative inline-flex items-center gap-2 overflow-hidden bg-off-white px-3 py-2 transition-colors hover:bg-off-white-light";

  const content = (
    <>
      <span className="relative z-10 font-mono text-sm uppercase tracking-tight text-off-black transition-colors group-hover:text-off-black">
        {children}
      </span>
      <motion.div className="relative z-10 flex size-4 items-center justify-center rounded-full bg-off-black px-px py-0.5">
        <IconArrowRight className="size-3" />
      </motion.div>
    </>
  );

  if (href) {
    return (
      <motion.a
        initial="normal"
        whileHover="hovered"
        href={href}
        className={cn(baseClasses, className)}
        {...rest}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      initial="normal"
      whileHover="hovered"
      className={cn(baseClasses, className)}
      {...rest}
    >
      {content}
    </motion.button>
  );
}

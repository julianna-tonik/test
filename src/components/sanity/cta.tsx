"use client";

import Magnetic from "@/components/ui/magnetic";
import { motion } from "motion/react";
import { BookCallLink } from "@/components/contact-us-button";
import { SANITY_BOOK_CALL_HREF } from "./shared";

export function SanityCta() {
  return (
    <section className="flex w-full flex-col gap-16 md:gap-32 pb-[120px] max-w-container-6xl">
      <Magnetic className="w-full">
        <BookCallLink href={SANITY_BOOK_CALL_HREF}
          magnetic={false}
          asChild
          className="group relative flex min-h-[350px] gap-16 w-full flex-col justify-between text-start overflow-clip bg-dark-grey p-5"
        >
          <motion.a
            whileHover="hovered"
            initial="normal"
            whileTap="hovered"
          >
            {/* Expanding circle background */}

            <p className="font-mono text-xs uppercase leading-3 tracking-tight text-off-white transition-colors duration-300 group-active:text-off-black group-hover:text-off-black z-20">
              WORK WITH TONIK
            </p>

            <motion.div className="flex w-full items-center justify-between">
              <p className="flex-1 text-4xl md:text-[120px] leading-none tracking-tight text-off-white transition-colors duration-300 group-hover:text-off-black group-active:text-off-black z-10">
                Move faster.<br />Stay in control.
              </p>
              <motion.div className="relative flex p-2 size-12 md:size-[100px] shrink-0 items-center justify-center rounded-full bg-off-white transition-colors duration-300 group-hover:bg-off-black group-active:text-off-black">
                <motion.div
                  className="absolute right-0 bottom-0 w-full h-full rounded-full bg-off-white"
                  variants={{
                    normal: {
                      scale: 1,
                    },
                    hovered: {
                      scale: 30,
                      transition: {
                        duration: 0.5,
                        ease: [0.33, 1, 0.68, 1],
                      },
                    },
                  }}
                />
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  className="relative z-10"
                >
                  <path
                    d="M12 32H52M52 32L32 12M52 32L32 52"
                    className="stroke-dark-grey transition-colors duration-300"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.a>
        </BookCallLink>
      </Magnetic>
    </section>
  );
}

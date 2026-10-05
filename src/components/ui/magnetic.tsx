"use client";

import React, { useRef } from "react";
import { motion, useSpring } from "motion/react";
import { useCursor } from "./sticky-cursor";
import { cn, isTouchDevice } from "@/lib/utils";

export default function Magnetic({
  children,
  className,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { setIsHovered, setHoveredState, setMagneticSpring } = useCursor();

  // Spring configuration for the snap effect
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };

  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if(isTouchDevice()) return;

    const { clientX, clientY } = e;

    if (ref.current) {
      const { height, width, left, top } = ref.current.getBoundingClientRect();

      // Calculate distance from center
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);

      // Normalize movement: (distance / dimension) * max_range
      // This ensures consistent movement regardless of button size
      const MAX_MOVE = 20;

      const moveX = (middleX / (width / 2)) * MAX_MOVE;
      const moveY = (middleY / (height / 2)) * MAX_MOVE;

      x.set(moveX);
      y.set(moveY);
    }
  };

  const handleMouseLeave = () => {
    if(isTouchDevice()) return;

    x.set(0);
    y.set(0);
    setIsHovered(false);
    setHoveredState(null);
    setMagneticSpring(null);
  };

  const handleMouseEnter = () => {
    if(isTouchDevice()) return;

    setIsHovered(true);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      setHoveredState({
        docLeft: rect.left + scrollX,
        docTop: rect.top + scrollY,
        width: rect.width,
        height: rect.height,
      });
      setMagneticSpring({ x, y });
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ x, y }}
      className={cn("inline-block hover:cursor-none", className)} // Hide default cursor on hover
      {...rest}
    >
      {children}
    </motion.div>
  );
}

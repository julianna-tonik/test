"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  motion,
  useSpring,
  MotionValue,
  SpringOptions,
  useAnimationFrame,
  useMotionValue,
} from "motion/react";

type HoveredState = {
  docLeft: number;
  docTop: number;
  width: number;
  height: number;
};

type CursorContextType = {
  isHovered: boolean;
  setIsHovered: (value: boolean) => void;
  hoveredState: HoveredState | null;
  setHoveredState: (state: HoveredState | null) => void;
  magneticSpring: { x: MotionValue<number>; y: MotionValue<number> } | null;
  setMagneticSpring: (
    spring: { x: MotionValue<number>; y: MotionValue<number> } | null,
  ) => void;
};

const CursorContext = createContext<CursorContextType>({
  isHovered: false,
  setIsHovered: () => {},
  hoveredState: null,
  setHoveredState: () => {},
  magneticSpring: null,
  setMagneticSpring: () => {},
});

export const useCursor = () => useContext(CursorContext);

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredState, setHoveredState] = useState<HoveredState | null>(null);
  const [magneticSpring, setMagneticSpring] = useState<{
    x: MotionValue<number>;
    y: MotionValue<number>;
  } | null>(null);

  return (
    <CursorContext.Provider
      value={{
        isHovered,
        setIsHovered,
        hoveredState,
        setHoveredState,
        magneticSpring,
        setMagneticSpring,
      }}
    >
      {children}
      <StickyCursor />
    </CursorContext.Provider>
  );
}

function StickyCursor() {
  const { isHovered, hoveredState, magneticSpring } = useCursor();
  const [isWithinWindow, setIsWithinWindow] = useState(false);

  const springConfig: SpringOptions = {
    stiffness: 300,
    damping: 20,
    mass: 0.5,
  };
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const DEFAULT_SIZE = 8;
  const padding = 20;

  const cursorWidth = useSpring(DEFAULT_SIZE, springConfig);
  const cursorHeight = useSpring(DEFAULT_SIZE, springConfig);

  useEffect(() => {
    const manageMouseMove = (e: MouseEvent) => {
      setIsWithinWindow(true);
      if (!isHovered) {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
        cursorWidth.set(DEFAULT_SIZE);
        cursorHeight.set(DEFAULT_SIZE);
      }
    };

    const manageMouseLeave = () => {
      setIsWithinWindow(false);
    };

    window.addEventListener("mousemove", manageMouseMove);
    document.body.addEventListener("mouseenter", manageMouseMove);
    document.body.addEventListener("mouseleave", manageMouseLeave);

    return () => {
      window.removeEventListener("mousemove", manageMouseMove);
      document.body.removeEventListener("mouseenter", manageMouseMove);
      document.body.removeEventListener("mouseleave", manageMouseLeave);
    };
  }, [isHovered, cursorX, cursorY, cursorWidth, cursorHeight]);

  useAnimationFrame(() => {
    if (isHovered && hoveredState && magneticSpring) {
      const x = magneticSpring.x.get();
      const y = magneticSpring.y.get();
      
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      const targetX = (hoveredState.docLeft - scrollX) + (hoveredState.width / 2) + x;
      const targetY = (hoveredState.docTop - scrollY) + (hoveredState.height / 2) + y;

      cursorX.set(targetX);
      cursorY.set(targetY);

      cursorWidth.set(hoveredState.width + padding);
      cursorHeight.set(hoveredState.height + padding);
    }
  });

  return (
    <motion.div
      style={{
        left: 0,
        top: 0,
        x: cursorX,
        y: cursorY,
      }}
      className="pointer-events-none fixed z-[9999]"
    >
      <motion.div
        style={{
          width: cursorWidth,
          height: cursorHeight,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          opacity: isWithinWindow ? 1 : 0,
        }}
        className="relative flex items-center justify-center"
      >
        {/* The corners (visible when hovered) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 mix-blend-difference"
        >
          {/* Top Left */}
          <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-white" />
          {/* Top Right */}
          <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-white" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-white" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-white" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

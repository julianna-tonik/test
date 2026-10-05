"use client";
import Spline from "@splinetool/react-spline";
import { useRef, useCallback, useEffect } from "react";
import type { Application, SPEObject } from "@splinetool/runtime";
import { useAnimationFrame } from "motion/react";

// Configuration
const MAX_ROTATION = Math.PI / 12; // ~15 degrees max rotation
const LERP_FACTOR = 0.08; // Smoothing factor (0-1, lower = smoother)

export function SplineLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRingRef = useRef<SPEObject | null>(null);
  const innerLogoRef = useRef<SPEObject | null>(null);
  const isLoadedRef = useRef(false);

  // Store initial rotations to add offsets to
  const initialRotations = useRef<{
    outer: { x: number; y: number; z: number } | null;
    inner: { x: number; y: number; z: number } | null;
  }>({ outer: null, inner: null });

  // Target rotation values (what we're lerping towards)
  const targetRotation = useRef({ x: 0, y: 0 });
  // Current interpolated rotation values
  const currentRotation = useRef({ x: 0, y: 0 });

  // Linear interpolation helper
  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useAnimationFrame((t, d) => {
    if (!isLoadedRef.current) {
      return;
    }

    // Lerp current rotation towards target
    currentRotation.current.x = lerp(
      currentRotation.current.x,
      targetRotation.current.x,
      LERP_FACTOR,
    );
    currentRotation.current.y = lerp(
      currentRotation.current.y,
      targetRotation.current.y,
      LERP_FACTOR,
    );

    // Apply to outer ring (rotates X in opposite direction)
    if (outerRingRef.current && initialRotations.current.outer) {
      outerRingRef.current.rotation.x =
        initialRotations.current.outer.x - currentRotation.current.x;
      outerRingRef.current.rotation.y =
        initialRotations.current.outer.y + currentRotation.current.y;
    }

    // Apply to inner logo (rotates X in normal direction)
    if (innerLogoRef.current && initialRotations.current.inner) {
      innerLogoRef.current.rotation.x =
        initialRotations.current.inner.x + currentRotation.current.x;
      innerLogoRef.current.rotation.y =
        initialRotations.current.inner.y + currentRotation.current.y;
    }
  });

  const onLoad = useCallback((spline: Application) => {
    // Object names from the Spline scene
    outerRingRef.current = spline.findObjectByName("orbit") ?? null;
    innerLogoRef.current = spline.findObjectByName("lettermark") ?? null;

    // Log what we found
    console.log("Outer ring found:", outerRingRef.current?.name ?? "NOT FOUND");
    console.log("Inner logo found:", innerLogoRef.current?.name ?? "NOT FOUND");

    // Store initial rotations
    if (outerRingRef.current) {
      initialRotations.current.outer = {
        x: outerRingRef.current.rotation.x,
        y: outerRingRef.current.rotation.y,
        z: outerRingRef.current.rotation.z,
      };
    }
    if (innerLogoRef.current) {
      initialRotations.current.inner = {
        x: innerLogoRef.current.rotation.x,
        y: innerLogoRef.current.rotation.y,
        z: innerLogoRef.current.rotation.z,
      };
    }

    // Mark as loaded so animation loop can start manipulating objects
    isLoadedRef.current = true;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isLoadedRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Normalize mouse position to -1 to 1 range (center is 0)
    const normalizedX = ((e.clientX / width) * 2 - 1);
    const normalizedY = ((e.clientY / height) * 2 - 1);

    // Set target rotation based on mouse position
    targetRotation.current.x = normalizedY * MAX_ROTATION;
    targetRotation.current.y = normalizedX * MAX_ROTATION;
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Reset target rotation to 0 (will lerp back smoothly)
    targetRotation.current.x = 0;
    targetRotation.current.y = 0;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <Spline
        scene="https://prod.spline.design/Nbj6s1LtKEf3QmSk/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
}

"use client";

import React from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: "fast" | "medium" | "slow" | "luxury";
  className?: string;
  amount?: number;
}

const durationMap = {
  fast: 0.15,
  medium: 0.3,
  slow: 0.6,
  luxury: 0.9
};

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = "slow",
  className = "",
  amount = 0.15
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount });

  const directionOffset = 24; // Subtle offset for Apple-like movement

  const getVariants = () => {
    switch (direction) {
      case "up":
        return { hidden: { opacity: 0, y: directionOffset }, visible: { opacity: 1, y: 0 } };
      case "down":
        return { hidden: { opacity: 0, y: -directionOffset }, visible: { opacity: 1, y: 0 } };
      case "left":
        return { hidden: { opacity: 0, x: directionOffset }, visible: { opacity: 1, x: 0 } };
      case "right":
        return { hidden: { opacity: 0, x: -directionOffset }, visible: { opacity: 1, x: 0 } };
      case "none":
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      default:
        return { hidden: { opacity: 0, y: directionOffset }, visible: { opacity: 1, y: 0 } };
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getVariants()}
      transition={{
        duration: durationMap[duration],
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom cubic bezier (smooth transition)
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

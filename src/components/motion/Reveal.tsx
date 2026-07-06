"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: "fast" | "medium" | "slow" | "luxury";
  className?: string;
  direction?: "left-to-right" | "top-to-bottom" | "scale-up";
}

const durationMap = {
  fast: 0.15,
  medium: 0.3,
  slow: 0.6,
  luxury: 0.9
};

export function Reveal({
  children,
  delay = 0,
  duration = "slow",
  className = "",
  direction = "left-to-right"
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const getVariants = () => {
    switch (direction) {
      case "left-to-right":
        return {
          hidden: { clipPath: "inset(0 100% 0 0)" },
          visible: { clipPath: "inset(0 0% 0 0)" }
        };
      case "top-to-bottom":
        return {
          hidden: { clipPath: "inset(0 0 100% 0)" },
          visible: { clipPath: "inset(0 0 0% 0)" }
        };
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: 0.98 },
          visible: { opacity: 1, scale: 1 }
        };
      default:
        return {
          hidden: { clipPath: "inset(0 100% 0 0)" },
          visible: { clipPath: "inset(0 0% 0 0)" }
        };
    }
  };

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={getVariants()}
        transition={{
          duration: durationMap[duration],
          delay,
          ease: [0.25, 1, 0.5, 1] // Custom luxury ease
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

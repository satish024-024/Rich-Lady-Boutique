"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 1200; // 1.2 seconds
    const intervalTime = 10;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsVisible(false), 200);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none">
          
          {/* LEFT CURTAIN PANEL (Slides Left on Exit) */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
            className="absolute left-0 inset-y-0 w-1/2 bg-forest-green border-r border-muted-gold/25 z-20 flex justify-end"
          >
            {/* Shading shadow to give fabric fold depth */}
            <div className="w-20 h-full bg-gradient-to-r from-transparent to-black/15" />
          </motion.div>

          {/* RIGHT CURTAIN PANEL (Slides Right on Exit) */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.85, ease: [0.77, 0, 0.175, 1] }}
            className="absolute right-0 inset-y-0 w-1/2 bg-forest-green border-l border-muted-gold/25 z-20 flex justify-start"
          >
            {/* Shading shadow to give fabric fold depth */}
            <div className="w-20 h-full bg-gradient-to-l from-transparent to-black/15" />
          </motion.div>

          {/* CENTER BRANDING & NEEDLE ANIMATION (Fades on Exit) */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="z-30 flex flex-col items-center justify-center px-6 text-center max-w-sm w-full"
          >
            
            {/* Lady Silhouette Oval Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative w-16 h-24 mb-6 border border-muted-gold/45 rounded-full flex items-center justify-center overflow-hidden bg-[#2D221C]/35 backdrop-blur-xs"
            >
              <svg
                viewBox="0 0 100 150"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-20 text-muted-gold"
              >
                <path
                  d="M50 25C54.4183 25 58 21.4183 58 17C58 12.5817 54.4183 9 50 9C45.5817 9 42 12.5817 42 17C42 21.4183 45.5817 25 50 25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M50 25C44 29 38 35 36 45C34 55 35 75 35 85C35 95 38 125 50 140C62 125 65 95 65 85C65 75 66 55 64 45C62 35 56 29 50 25Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                />
                <path
                  d="M38 52C42 55 48 56 50 56C52 56 58 55 62 52"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeMiterlimit="10"
                />
                <path
                  d="M44 70C46 72 49 73 50 73C51 73 54 72 56 70"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeMiterlimit="10"
                />
                <path
                  d="M50 25V140"
                  stroke="currentColor"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
              </svg>
            </motion.div>

            {/* Custom Stitching Needle & Thread SVG Loop */}
            <div className="w-full flex justify-center mb-6">
              <svg viewBox="0 0 100 24" className="w-36 h-8 text-muted-gold">
                {/* Thread Wave Path */}
                <motion.path
                  d="M 5,12 Q 25,4 45,12 T 85,12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Sewing Needle moving along waves */}
                <motion.g
                  animate={{
                    x: [0, 40, 80, 0],
                    y: [0, -4, 0, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M10,12 L24,7 M11,11 A0.75,0.75 0 1,1 11.5,12" stroke="currentColor" strokeWidth="1" fill="none" />
                </motion.g>
              </svg>
            </div>

            {/* Brand text titles */}
            <h1 className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-primary-bg uppercase font-bold leading-none">
              Rich Lady
            </h1>
            <p className="text-[8px] uppercase tracking-[0.35em] text-muted-gold font-bold mt-2">
              The Luxury Atelier
            </p>

            {/* Progress status */}
            <p className="text-[10px] font-serif italic text-primary-bg/75 mt-8 mb-2 tracking-wider">
              Weaving Elegance...
            </p>

            {/* Gold Progress bar strip */}
            <div className="w-32 h-[1px] bg-primary-bg/15 overflow-hidden relative rounded-full">
              <motion.div
                className="h-full bg-muted-gold rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 1400; // 1.4 seconds
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none bg-transparent">
          
          {/* LEFT WEAVING CURTAIN PANEL (Slides Left on Exit) */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }}
            className="absolute left-0 inset-y-0 w-1/2 bg-[#23352D] border-r border-[#B8904A]/25 z-20 flex justify-end"
          >
            {/* Soft shadow edge mapping drapery folds */}
            <div className="w-24 h-full bg-gradient-to-r from-transparent to-black/30" />
          </motion.div>

          {/* RIGHT WEAVING CURTAIN PANEL (Slides Right on Exit) */}
          <motion.div
            initial={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.9, ease: [0.77, 0, 0.175, 1] }}
            className="absolute right-0 inset-y-0 w-1/2 bg-[#23352D] border-l border-[#B8904A]/25 z-20 flex justify-start"
          >
            {/* Soft shadow edge mapping drapery folds */}
            <div className="w-24 h-full bg-gradient-to-l from-transparent to-black/30" />
          </motion.div>

          {/* INTERLACED WARP & WEFT SVG THREADS (Z-20 Overlay behind branding) */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-40">
            <svg className="w-full h-full stroke-[#B8904A] stroke-[0.75]">
              {/* Vertical Warp Threads */}
              <motion.line
                x1="35%" y1="0" x2="35%" y2="100%"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              <motion.line
                x1="65%" y1="0" x2="65%" y2="100%"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              />
              
              {/* Horizontal Weft Threads */}
              <motion.line
                x1="0" y1="35%" x2="100%" y2="35%"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
              />
              <motion.line
                x1="0" y1="65%" x2="100%" y2="65%"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
              />

              {/* Central Weave Alignment Circle */}
              <motion.circle
                cx="50%" cy="50%" r="90"
                fill="none"
                strokeDasharray="4 4"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </svg>
          </div>

          {/* SOLAR FLARE GLOW FLASH (Simulates Loom Thread Tension Snap) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0] }}
            transition={{ duration: 0.45, delay: 0.75 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#B8904A]/25 via-white/50 to-transparent pointer-events-none z-30"
          />

          {/* CENTRAL LUXYRY BRANDING & HUD SPECIFICATIONS (Z-30 Fades on Exit) */}
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="z-30 flex flex-col items-center justify-center px-6 text-center max-w-sm w-full font-sans"
          >
            {/* Rich Lady Monogram Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="w-20 h-20 border border-[#B8904A]/60 rounded-full flex items-center justify-center bg-[#2D221C]/50 backdrop-blur-xs mb-8 shadow-luxury"
            >
              <span className="font-serif text-2xl text-[#FAF8F3] tracking-widest font-bold ml-1">RL</span>
            </motion.div>

            {/* Brand Title */}
            <motion.h1 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-[#FAF8F3] uppercase font-bold leading-none"
            >
              Rich Lady
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[7.5px] uppercase tracking-[0.35em] text-[#B8904A] font-bold mt-2.5"
            >
              The Luxury Atelier
            </motion.p>

            {/* Weaving Specifications HUD (Editorial Craft Metrics) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col gap-1.5 uppercase text-[7px] tracking-[0.28em] text-[#FAF8F3]/80 border-t border-[#B8904A]/20 pt-4 mt-6 w-48 mx-auto font-medium"
            >
              <span>Warp: 140s Double Warp</span>
              <span>Weft: Handloom Silk Weave</span>
              <span>Origin: Rajamahendravaram</span>
            </motion.div>

            {/* Progress Text */}
            <p className="text-[10px] font-serif italic text-[#FAF8F3]/60 mt-10 mb-2.5 tracking-wider">
              Weaving Elegance...
            </p>

            {/* Gold Progress line */}
            <div className="w-32 h-[1px] bg-[#FAF8F3]/15 overflow-hidden relative rounded-full">
              <motion.div
                className="h-full bg-[#B8904A] rounded-full"
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

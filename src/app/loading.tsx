"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 1000; // 1 second
    const intervalTime = 10;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Small delay before fading out
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
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary-bg"
        >
          <div className="flex flex-col items-center max-w-xs w-full px-6">
            {/* Lady Silhouette Oval Logo */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-8 flex flex-col items-center"
            >
              <div className="relative w-16 h-24 mb-4 border border-muted-gold/40 rounded-full flex items-center justify-center overflow-hidden bg-card">
                <svg
                  viewBox="0 0 100 150"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-20 text-muted-gold"
                >
                  {/* Styled Lady Silhouette */}
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
              </div>
              <h1 className="font-serif text-2xl tracking-widest text-primary-text uppercase">
                Rich Lady
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-secondary-text mt-1">
                Boutique
              </p>
            </motion.div>

            {/* Progress Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="text-xs font-serif italic text-secondary-text mb-2 tracking-wide"
            >
              Crafting Elegance...
            </motion.p>

            {/* Gold Progress Line */}
            <div className="w-40 h-[1.5px] bg-border-accent/40 overflow-hidden relative rounded-full">
              <motion.div
                className="h-full bg-muted-gold rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

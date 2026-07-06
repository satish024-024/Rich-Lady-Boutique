"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MotionContextType {
  isPageLoaded: boolean;
}

const MotionContext = createContext<MotionContextType>({ isPageLoaded: false });

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Set page loaded state after initial render
    const timer = setTimeout(() => setIsPageLoaded(true), 1200); // Align with loading.tsx transition
    return () => clearTimeout(timer);
  }, []);

  return (
    <MotionContext.Provider value={{ isPageLoaded }}>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </MotionContext.Provider>
  );
}

export function useMotionState() {
  return useContext(MotionContext);
}

"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { toast } from "sonner";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Scroll calculations
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("collection");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleStoryClick = () => {
    const target = document.getElementById("journey");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-primary-bg flex items-center justify-start select-none"
      id="hero"
    >
      {/* Framed Cinematic Background Video - Floating layout match */}
      <motion.div 
        style={{ y }} 
        className="absolute inset-2 md:inset-4 rounded-[2rem] md:rounded-[3rem] border border-border-accent/25 overflow-hidden shadow-luxury z-0 bg-secondary-bg"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          poster="/images/hero-fallback.jpg"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            willChange: "transform"
          }}
        >
          <source src="/videos/hero-placeholder.mp4" type="video/mp4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-fallback.jpg"
            alt="Cinematic Cotton Branch Fallback"
            className="w-full h-full object-cover"
          />
        </video>
      </motion.div>

      {/* Hero Content Overlay */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1], delay: 0.2 }}
          className="max-w-xl md:max-w-2xl flex flex-col items-start ml-2 md:ml-4"
        >
          {/* Editorial Tag */}
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-4 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.4)]">
            From Nature to Your Wardrobe
          </span>

          {/* Big Serif Heading */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
            Elegance Woven <br className="hidden md:inline" />
            for Every Woman
          </h1>

          {/* Ornament line */}
          <div className="w-24 h-[1px] bg-muted-gold/60 mb-6 drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" />

          {/* Subheading text */}
          <p className="font-sans text-xs md:text-sm text-white/90 leading-relaxed mb-10 max-w-lg font-light tracking-wide drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.6)]">
            Since 2011 we curate premium quality fashion at affordable prices.
            Wholesale & Retail. Worldwide Shipping.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleExploreClick}
              className="group bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 md:px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/25 hover:border-muted-gold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 text-muted-gold group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleStoryClick}
              className="group bg-transparent hover:bg-white hover:text-forest-green text-white px-6 md:px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-white/60 hover:border-white transition-all duration-300 flex items-center gap-2 cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
            >
              Our Story
              <Play className="w-3.5 h-3.5 text-muted-gold fill-muted-gold opacity-80 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Subtle bottom scroll indicator */}
      <motion.div
        style={{ opacity }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-80 cursor-pointer pointer-events-none"
      >
        <span className="text-[8px] uppercase tracking-[0.3em] text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] font-sans font-semibold">Scroll</span>
        <div className="w-[1px] h-8 bg-white/60" />
      </motion.div>
    </section>
  );
}

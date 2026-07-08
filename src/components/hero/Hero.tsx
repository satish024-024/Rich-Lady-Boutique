"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, MessageCircle } from "lucide-react";
import { heroData } from "@/data/hero";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Scroll & opacity calculations
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("budget-shop");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleWhatsAppClick = () => {
    window.open(heroData.secondaryCtaLink, "_blank");
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-primary-bg flex items-center justify-start select-none"
      id="hero"
    >
      {/* Framed Cinematic Background Video */}
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
          className="w-full h-full object-cover brightness-[0.75]"
          poster="/images/hero-fallback.jpg"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            willChange: "transform"
          }}
        >
          <source src={heroData.videoUrl} type="video/mp4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-fallback.jpg"
            alt="Cinematic Indian Boutique Fabric"
            className="w-full h-full object-cover"
          />
        </video>
      </motion.div>

      {/* Hero Content Overlay (Left-aligned clean design) */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.15 }}
          className="max-w-xl md:max-w-2xl flex flex-col items-start ml-2 md:ml-4"
        >
          {/* Editorial Tag */}
          <span className="font-sans text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-bold uppercase mb-4 drop-shadow-sm">
            Nature • Craftsmanship • Fashion • Confidence
          </span>

          {/* Big Serif Heading */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6 font-normal drop-shadow-md">
            {heroData.heading}
          </h1>

          {/* Ornament Hairline Divider */}
          <div className="w-24 h-[1px] bg-muted-gold/60 mb-6" />

          {/* Subheading text */}
          <p className="font-sans text-xs md:text-sm text-white/90 leading-relaxed mb-10 max-w-lg font-light tracking-wide drop-shadow-xs">
            {heroData.subheading}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={handleExploreClick}
              className="group bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 md:px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/25 hover:border-muted-gold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
            >
              Explore Collection
              <ArrowRight className="w-3.5 h-3.5 text-muted-gold group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={handleWhatsAppClick}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white px-6 md:px-8 py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-white/25 hover:border-white transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
              Chat on WhatsApp
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating play scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 z-10 text-white/40">
        <span className="text-[8px] uppercase tracking-widest font-sans font-medium">Scroll to Discover</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-white/45 to-transparent animate-pulse" />
      </div>
    </section>
  );
}

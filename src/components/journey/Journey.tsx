"use client";

import React from "react";
import { journeyData } from "@/data/journey";
import { FadeIn } from "@/components/motion/FadeIn";

export function Journey() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="journey"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            The Weave Story
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Our Journey
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Interactive Steps Slider */}
        <FadeIn delay={0.15} duration="slow" className="w-full overflow-x-auto no-scrollbar py-6">
          <div className="min-w-[1200px] flex items-stretch gap-8 relative px-4">
            
            {/* SVG Connecting Flow Line */}
            <div className="absolute top-12 inset-x-0 h-[1px] bg-gradient-to-r from-muted-gold/10 via-muted-gold/45 to-muted-gold/10 -z-10" />

            {journeyData.map((node) => (
              <div
                key={node.id}
                className="w-[280px] bg-card border border-border-accent/35 rounded-2xl p-6 shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-medium flex flex-col items-start gap-4 relative"
              >
                {/* step indicator circle */}
                <div className="w-10 h-10 rounded-full bg-forest-green border border-muted-gold/30 flex items-center justify-center text-primary-bg text-[10px] font-sans font-bold shadow-xs">
                  {node.stepNumber}
                </div>

                {/* Info titles */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif text-sm text-primary-text font-semibold">
                    {node.title}
                  </h3>
                  <p className="text-[10px] font-sans font-light text-secondary-text leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </FadeIn>

        {/* Mobile Swipe Guide */}
        <div className="flex justify-center mt-6 opacity-60">
          <span className="text-[9px] uppercase tracking-[0.2em] text-secondary-text animate-pulse">
            ← Scroll horizontally to trace our boutique journey →
          </span>
        </div>

      </div>
    </section>
  );
}

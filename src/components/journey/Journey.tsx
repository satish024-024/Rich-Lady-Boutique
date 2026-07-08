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

        {/* Journey Grid */}
        <FadeIn delay={0.15} duration="slow" className="w-full py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 relative">
            
            {/* Horizontal Connecting Flow Line (only visible on large screens) */}
            <div className="hidden lg:block absolute top-12 left-12 right-12 h-[1px] bg-gradient-to-r from-muted-gold/15 via-muted-gold/50 to-muted-gold/15 -z-10" />

            {journeyData.map((node) => (
              <div
                key={node.id}
                className="bg-card border border-border-accent/30 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-luxury hover:border-muted-gold/40 transition-all duration-medium flex flex-col items-start gap-5 relative group"
              >
                {/* step indicator circle */}
                <div className="w-10 h-10 rounded-full bg-forest-green border border-muted-gold/20 flex items-center justify-center text-primary-bg text-xs font-sans font-bold shadow-xs group-hover:scale-105 transition-transform duration-medium">
                  {node.stepNumber}
                </div>

                {/* Info titles */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-sm md:text-base text-primary-text font-normal tracking-wide group-hover:text-muted-gold transition-colors duration-medium">
                    {node.title}
                  </h3>
                  <p className="text-[11px] font-sans font-light text-secondary-text leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </FadeIn>

      </div>
    </section>
  );
}

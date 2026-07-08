"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

export function Festival() {
  return (
    <section
      className="w-full py-20 bg-secondary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="festival-spotlight"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Large Banner Spotlight */}
        <FadeIn className="w-full max-w-5xl mx-auto bg-card border border-border-accent/35 rounded-[2.5rem] overflow-hidden shadow-luxury flex flex-col lg:flex-row items-center relative">
          
          {/* Text block left */}
          <div className="w-full lg:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col items-start gap-4">
            <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-muted-gold font-bold bg-secondary-bg border border-border-accent/40 px-3.5 py-1 rounded-full">
              Festival Spotlight
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-primary-text font-normal leading-tight mt-2">
              The Festive Heritage
            </h2>
            <div className="w-16 h-[1px] bg-muted-gold/60 my-2" />
            <p className="font-sans text-xs md:text-sm text-secondary-text font-light leading-relaxed max-w-md">
              Celebrate in elegance. Discover hand-weaved organza sarees, designer ethnic gowns, and silk kurtis highlighted with heavy gotapatti thread work.
            </p>
            
            {/* CTA */}
            <Link
              href="/catalog?occasion=festival"
              className="group bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 md:px-8 py-3 rounded-full border border-muted-gold/25 hover:border-muted-gold transition-all duration-300 flex items-center gap-2 mt-4 cursor-pointer text-[9px] uppercase tracking-widest font-semibold"
            >
              Shop Festive Edits
              <ArrowRight className="w-3.5 h-3.5 text-muted-gold group-hover:translate-x-0.5 transition-transform duration-300" />
            </Link>
          </div>

          {/* Image panel right */}
          <div className="w-full lg:w-1/2 aspect-video lg:aspect-[4/3] bg-secondary-bg overflow-hidden relative self-stretch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/festival_spotlight.jpg"
              alt="Festive Boutique Wear"
              className="w-full h-full object-cover transition-transform duration-slow hover:scale-[1.02]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/featured_fallback.jpg";
              }}
            />
            {/* Soft gold tint overlay */}
            <div className="absolute inset-0 bg-muted-gold/5 pointer-events-none" />
          </div>

        </FadeIn>

      </div>
    </section>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { budgetData } from "@/data/budget";
import { FadeIn } from "@/components/motion/FadeIn";

export function Budget() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="budget-shop"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-12">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Curated Values
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Shop by Budget
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* 5 columns budget grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {budgetData.map((item, idx) => (
            <FadeIn
              key={item.id}
              delay={idx * 0.08}
              duration="slow"
              className="flex flex-col items-center group cursor-pointer"
            >
              <Link href={item.link} className="w-full flex flex-col items-center">
                {/* Visual Cover card */}
                <div className="w-full aspect-[4/5] bg-card border border-border-accent/35 rounded-lg overflow-hidden shadow-xs group-hover:shadow-luxury group-hover:border-muted-gold/45 transition-all duration-500 relative">
                  
                  {/* Subtle placeholder image if not present */}
                  <div className="w-full h-full bg-secondary-bg relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                      onError={(e) => {
                        // fallback placeholder if image does not exist yet
                        (e.target as HTMLImageElement).src = "/images/budget_fallback.jpg";
                      }}
                    />
                    {/* Soft Brown Overlay */}
                    <div className="absolute inset-0 bg-[#3B2B24]/40 group-hover:bg-[#3B2B24]/30 transition-colors duration-medium pointer-events-none" />
                  </div>

                  {/* Absolute Center Price tag */}
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-10">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-white/70 font-bold mb-1">
                      {item.title}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl text-white font-medium mb-3">
                      {item.priceLabel}
                    </h3>
                    
                    {/* Spaced arrow label */}
                    <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.25em] text-white bg-forest-green px-4 py-2 rounded-full border border-muted-gold/30 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                      Shop Now
                      <ArrowRight className="w-3.5 h-3.5 text-muted-gold" />
                    </span>
                  </div>

                </div>

                {/* Tagline details below */}
                <p className="text-[10px] font-sans font-light text-secondary-text mt-4 text-center max-w-[200px] leading-relaxed group-hover:text-muted-gold transition-colors duration-300">
                  {item.tagline}
                </p>
              </Link>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

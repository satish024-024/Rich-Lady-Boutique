"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categoriesData } from "@/data/categories";
import { FadeIn } from "@/components/motion/FadeIn";

export function Categories() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="collection"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Curated Boutiques
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Shop by Category
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Categories Grid - 8 Items layout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-7xl mx-auto">
          {categoriesData.map((cat, idx) => (
            <FadeIn
              key={cat.id}
              delay={idx * 0.06}
              duration="slow"
              className="flex flex-col items-center group cursor-pointer"
            >
              <Link href={cat.link} className="w-full flex flex-col items-center">
                
                {/* Rounded Arch Card Container */}
                <div className="w-full aspect-[2/3] overflow-hidden bg-card border border-border-accent/40 shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-500 rounded-[120px_120px_20px_20px] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.imageUrl}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/cat_fallback.jpg";
                    }}
                  />
                  {/* Overlay for subtle color matching */}
                  <div className="absolute inset-0 bg-[#3B2B24]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-medium pointer-events-none" />
                </div>

                {/* Category Title */}
                <h3 className="font-serif text-xs text-primary-text uppercase tracking-widest mt-5 mb-1 text-center font-medium group-hover:text-muted-gold transition-colors duration-300">
                  {cat.title}
                </h3>

                {/* Explore CTA Label */}
                <span className="flex items-center gap-1 text-[8px] uppercase tracking-[0.2em] text-secondary-text group-hover:text-muted-gold transition-colors duration-300">
                  Explore
                  <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

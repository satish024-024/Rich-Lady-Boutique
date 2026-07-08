"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { featuredData } from "@/data/featured";
import { FadeIn } from "@/components/motion/FadeIn";

export function Featured() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="featured-collections"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Curated Themes
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Featured Collections
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Banners loop - Alternating layouts */}
        <div className="flex flex-col gap-16 md:gap-24 max-w-5xl mx-auto">
          {featuredData.map((col, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={col.id}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Image panel */}
                <FadeIn
                  delay={0.1}
                  duration="slow"
                  className="w-full md:w-1/2 aspect-[4/3] md:aspect-[3/2] overflow-hidden rounded-[2rem] border border-border-accent/35 shadow-luxury relative bg-secondary-bg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={col.imageUrl}
                    alt={col.heading}
                    className="w-full h-full object-cover transition-transform duration-slow hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/featured_fallback.jpg";
                    }}
                  />
                </FadeIn>

                {/* Text narrative panel */}
                <FadeIn
                  delay={0.2}
                  duration="slow"
                  className="w-full md:w-1/2 flex flex-col items-start gap-4"
                >
                  <span className="font-sans text-[8px] uppercase tracking-[0.25em] text-muted-gold font-bold">
                    {col.title}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl text-primary-text font-medium leading-snug">
                    {col.heading}
                  </h3>
                  <div className="w-12 h-[1px] bg-muted-gold/45" />
                  <p className="font-sans text-xs md:text-sm text-secondary-text font-light leading-relaxed max-w-md">
                    {col.description}
                  </p>
                  
                  {/* Luxury CTA */}
                  <Link
                    href={col.link}
                    className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-forest-green hover:text-muted-gold transition-colors duration-medium group mt-2"
                  >
                    {col.ctaText}
                    <ArrowRight className="w-4 h-4 text-muted-gold group-hover:translate-x-1 transition-transform duration-medium" />
                  </Link>
                </FadeIn>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

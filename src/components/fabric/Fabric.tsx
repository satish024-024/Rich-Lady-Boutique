"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { fabricData } from "@/data/fabrics";
import { FadeIn } from "@/components/motion/FadeIn";

export function Fabric() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="fabric-shop"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Material Select
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Shop by Fabric
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Fabrics horizontal grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {fabricData.map((item, idx) => (
            <FadeIn
              key={item.id}
              delay={idx * 0.05}
              duration="slow"
              className="flex flex-col items-center group cursor-pointer"
            >
              <Link href={item.link} className="w-full flex flex-col items-center">
                {/* Circular image style */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-border-accent/35 overflow-hidden bg-card shadow-xs group-hover:shadow-luxury group-hover:border-muted-gold/45 transition-all duration-500 relative flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/fab_fallback.jpg";
                      }}
                    />
                  </div>
                </div>

                {/* Fabric name */}
                <h3 className="font-serif text-sm text-primary-text font-medium mt-4 group-hover:text-muted-gold transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Short desc */}
                <p className="text-[10px] font-sans font-light text-secondary-text mt-1 text-center max-w-[150px] leading-relaxed group-hover:text-primary-text transition-colors duration-300">
                  {item.description}
                </p>

                {/* Arrow */}
                <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] text-muted-gold/80 group-hover:text-muted-gold transition-colors duration-300 mt-2 font-semibold">
                  View Weaves
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

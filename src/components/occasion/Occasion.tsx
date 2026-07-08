"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { occasionData } from "@/data/occasion";
import { FadeIn } from "@/components/motion/FadeIn";

export function Occasion() {
  return (
    <section
      className="w-full py-20 bg-secondary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="occasion-shop"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Styling Contexts
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Shop by Occasion
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Occasions grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {occasionData.map((item, idx) => (
            <FadeIn
              key={item.id}
              delay={idx * 0.06}
              duration="slow"
              className="flex flex-col items-center group cursor-pointer"
            >
              <Link href={item.link} className="w-full flex flex-col items-center">
                {/* Rectangular Image frame */}
                <div className="w-full aspect-[4/5] bg-card border border-border-accent/35 rounded-xl overflow-hidden shadow-xs group-hover:shadow-luxury group-hover:border-muted-gold/45 transition-all duration-500 relative">
                  
                  {/* Image wrapper */}
                  <div className="w-full h-full bg-secondary-bg relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/occ_fallback.jpg";
                      }}
                    />
                    {/* Charcoal/Gold gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3b2b24]/65 via-transparent to-transparent opacity-90 pointer-events-none" />
                  </div>

                  {/* Title overlay bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-5 flex justify-between items-center z-10">
                    <span className="font-serif text-base text-white font-medium">
                      {item.title}
                    </span>
                    <span className="p-1.5 bg-primary-bg/85 rounded-full text-primary-text opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90 transition-all duration-medium">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              </Link>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

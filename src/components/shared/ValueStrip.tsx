"use client";

import React from "react";
import { FadeIn } from "@/components/motion/FadeIn";

export function ValueStrip() {
  const badges = [
    {
      num: "01",
      title: "Since 2011",
      desc: "Over a decade of curated trust, styling families and celebrating heritage."
    },
    {
      num: "02",
      title: "Premium Quality",
      desc: "Carefully sourced finest threads, master craftsmanship, and pure handlooms."
    },
    {
      num: "03",
      title: "Affordable Prices",
      desc: "Bridging the gap between bespoke luxury fashion and accessible everyday pricing."
    },
    {
      num: "04",
      title: "Wholesale & Retail",
      desc: "Custom tailor bulk orders or individual fittings with equal devotion."
    },
    {
      num: "05",
      title: "Worldwide Shipping",
      desc: "Draping elegance across borders with fast, fully insured global shipping."
    }
  ];

  return (
    <div className="w-full bg-[#FAF8F3] border-y border-border-accent/35 py-16 select-none font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-y-12 md:gap-x-4 lg:gap-x-6">
          {badges.map((badge, idx) => {
            return (
              <FadeIn
                key={badge.title}
                delay={idx * 0.06}
                duration="slow"
                className="flex flex-col items-start text-left gap-4 group px-4 border-l border-border-accent/15 md:border-l-0 md:border-r border-border-accent/20 last:border-r-0"
              >
                {/* Custom Elegant Serif Digit - layout match */}
                <span className="font-serif text-3xl md:text-4xl text-muted-gold/85 italic font-normal tracking-wide leading-none group-hover:scale-105 transition-transform duration-medium">
                  {badge.num}
                </span>
                
                {/* Title & Desc */}
                <div className="flex flex-col">
                  <h4 className="font-serif text-[11px] md:text-xs uppercase tracking-[0.2em] text-primary-text font-bold mb-2">
                    {badge.title}
                  </h4>
                  <p className="text-[10px] md:text-[11px] text-secondary-text leading-relaxed font-light max-w-[200px]">
                    {badge.desc}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
}

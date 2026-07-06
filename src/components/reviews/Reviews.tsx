"use client";

import React from "react";
import { FadeIn } from "@/components/motion/FadeIn";
import Script from "next/script";

export function Reviews() {
  return (
    <section
      className="w-full py-[120px] md:py-[90px] sm:py-[70px] bg-primary-bg overflow-hidden select-none border-b border-border-accent/35"
      id="reviews"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header - layout match */}
        <div className="flex justify-between items-end mb-16 max-w-7xl mx-auto border-b border-border-accent/25 pb-6">
          <FadeIn className="flex flex-col items-start text-left">
            <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
              Client Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary-text font-normal tracking-tight">
              Loved by Our Customers
            </h2>
          </FadeIn>
        </div>

        {/* Live Elfsight Google Reviews Widget */}
        <div className="w-full">
          <div className="elfsight-app-e71c4b3c-0581-40a8-b7b3-ad23efa9fdb5" data-elfsight-app-lazy />
        </div>

      </div>

      {/* Load Elfsight Platform Script */}
      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="afterInteractive"
      />
    </section>
  );
}

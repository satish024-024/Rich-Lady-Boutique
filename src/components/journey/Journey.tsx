"use client";

import React from "react";
import { FadeIn } from "@/components/motion/FadeIn";

export function Journey() {
  return (
    <section
      className="w-full py-16 md:py-12 bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="journey"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Responsive horizontal scroll wrapper for mobile, static on desktop */}
        <FadeIn delay={0.2} duration="luxury" className="w-full overflow-x-auto no-scrollbar py-4">
          <div className="min-w-[1000px] lg:min-w-[1100px] xl:min-w-0 max-w-6xl mx-auto">
            {/* Render the custom provided journey image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/journey.png"
              alt="Rich Lady Boutique Cotton-to-Closet Handcrafted Journey"
              className="w-full h-auto select-none pointer-events-none"
            />
          </div>
        </FadeIn>

        {/* Swipe guide helper for smaller viewports */}
        <div className="flex justify-center xl:hidden mt-2 opacity-50">
          <span className="text-[9px] uppercase tracking-[0.2em] text-secondary-text animate-pulse">
            ← Swipe horizontally to view our journey →
          </span>
        </div>

        {/* Visually Hidden Screen Reader Content for Accessibility (WCAG AA) and SEO */}
        <div className="sr-only">
          <h2>Our Journey</h2>
          <ol>
            <li>
              <strong>01 COTTON HARVEST:</strong> Pure cotton is handpicked from the finest farms.
            </li>
            <li>
              <strong>02 THREAD MAKING:</strong> The soft cotton is cleaned and spun into fine threads.
            </li>
            <li>
              <strong>03 NATURAL DYE:</strong> Threads are dyed using natural &amp; skin-friendly colors.
            </li>
            <li>
              <strong>04 FABRIC WEAVING:</strong> Skilled artisans weave the fabric with care and precision.
            </li>
            <li>
              <strong>05 DESIGN &amp; CRAFT:</strong> Unique designs come to life with traditional craftsmanship.
            </li>
            <li>
              <strong>06 MADE FOR YOU:</strong> Finished with love, crafted for your elegance.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}


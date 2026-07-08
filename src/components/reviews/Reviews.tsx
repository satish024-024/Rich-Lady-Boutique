"use client";

import React from "react";
import { Quote } from "lucide-react";
import { reviewsData } from "@/data/reviews";
import { FadeIn } from "@/components/motion/FadeIn";

export function Reviews() {
  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden select-none border-b border-border-accent/35"
      id="reviews"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            What Our Customers Love
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Handcrafted testimonial grid with arched parchment cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {reviewsData.map((rev, idx) => (
            <FadeIn
              key={rev.id}
              delay={idx * 0.05}
              duration="slow"
              className="bg-card border border-border-accent/35 rounded-tr-[2.5rem] rounded-bl-[2.5rem] rounded-tl-[10px] rounded-br-[10px] p-8 flex flex-col justify-between shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-500 min-h-[220px]"
            >
              {/* Quote Mark */}
              <div className="text-muted-gold/30 mb-4">
                <Quote className="w-8 h-8 rotate-180 fill-current" />
              </div>

              {/* Review Testimonial Italic Garamond Text */}
              <p className="font-serif italic text-sm text-primary-text/90 leading-relaxed flex-1">
                "{rev.text}"
              </p>

              {/* Author name bottom */}
              <div className="mt-6 pt-4 border-t border-border-accent/25 flex flex-col items-start gap-1">
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-primary-text">
                  {rev.author}
                </span>
                <span className="text-[8px] font-sans text-secondary-text/80 uppercase tracking-widest">
                  Verified Purchaser
                </span>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

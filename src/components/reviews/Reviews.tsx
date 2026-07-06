"use client";

import React, { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { reviewsData } from "@/data/reviews";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

export function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of screen width
      const targetScroll =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  const handleGoogleReviewsClick = () => {
    toast.info("Redirecting to Google Reviews... (Google Maps Integration Coming Soon)");
  };

  return (
    <section
      className="w-full py-[120px] md:py-[90px] sm:py-[70px] bg-primary-bg overflow-hidden select-none border-b border-border-accent/35"
      id="reviews"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header with Left/Right Buttons - layout match */}
        <div className="flex justify-between items-end mb-16 max-w-7xl mx-auto border-b border-border-accent/25 pb-6">
          <FadeIn className="flex flex-col items-start text-left">
            <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
              Client Testimonials
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary-text font-normal tracking-tight">
              Loved by Our Customers
            </h2>
          </FadeIn>

          {/* Slider Buttons - layout match */}
          <FadeIn className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-border-accent hover:border-muted-gold rounded-full flex items-center justify-center text-primary-text hover:text-muted-gold bg-card transition-all duration-medium cursor-pointer shadow-xs"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.25]" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-border-accent hover:border-muted-gold rounded-full flex items-center justify-center text-primary-text hover:text-muted-gold bg-card transition-all duration-medium cursor-pointer shadow-xs"
              aria-label="Next reviews"
            >
              <ChevronRight className="w-5 h-5 stroke-[1.25]" />
            </button>
          </FadeIn>
        </div>

        {/* Dashboard Layout Grid - layout match */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-7xl mx-auto">
          
          {/* Left Google Review Box - styled as premium editorial badge */}
          <FadeIn className="lg:col-span-4 bg-card border border-border-accent/40 p-10 rounded-[2.5rem] shadow-luxury flex flex-col items-center justify-center text-center">
            {/* Massive Serif Rating */}
            <span className="font-serif text-7xl md:text-8xl text-primary-text font-normal leading-none italic mb-4">
              5.0
            </span>
            
            {/* Stars */}
            <div className="flex items-center gap-1.5 text-muted-gold mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4.5 h-4.5 fill-muted-gold stroke-[0]" />
              ))}
            </div>

            <p className="font-sans text-xs tracking-wider uppercase font-semibold text-secondary-text/80 mb-8 leading-relaxed max-w-[200px]">
              Based on 35+ Google Reviews
            </p>

            <button
              onClick={handleGoogleReviewsClick}
              className="w-full py-4 bg-forest-green hover:bg-[#1a2b24] text-primary-bg text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              View Google Reviews
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-muted-gold">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>
          </FadeIn>

          {/* Right Sliding Cards - styled as arched parchment cards */}
          <div
            ref={scrollRef}
            className="lg:col-span-8 flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4"
          >
            {reviewsData.map((rev) => (
              <FadeIn
                key={rev.id}
                direction="none"
                className="w-[85vw] md:w-[350px] bg-[#FAF8F3] border border-border-accent/40 p-8 md:p-10 rounded-tr-[2.5rem] rounded-bl-[2.5rem] shadow-luxury flex-shrink-0 flex flex-col justify-between snap-start hover:border-muted-gold/40 transition-colors"
              >
                <div>
                  {/* Stars */}
                  <div className="flex items-center gap-1 text-muted-gold mb-6">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-muted-gold stroke-[0]" />
                    ))}
                  </div>
                  
                  {/* Review Quote Text */}
                  <p className="font-serif italic text-sm md:text-base text-primary-text/95 leading-relaxed font-light mb-8">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                {/* Author Capsule - layout match */}
                <div className="flex items-center gap-2 border-t border-border-accent/35 pt-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-gold" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-gold">
                    {rev.author}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

"use client";

import React from "react";
import * as Icons from "lucide-react";
import { servicesData } from "@/data/services";
import { FadeIn } from "@/components/motion/FadeIn";

export function Services() {
  return (
    <section
      className="w-full py-16 bg-secondary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="why-shop-with-us"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-12">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Our Commitments
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-primary-text font-normal mb-4">
            Why Shop With Us
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {servicesData.map((item, idx) => {
            // Dynamically resolve icon component
            const IconComponent = (Icons as any)[item.iconName] || Icons.HelpCircle;

            return (
              <FadeIn
                key={item.id}
                delay={idx * 0.05}
                duration="slow"
                className="flex flex-col items-center text-center p-4"
              >
                {/* Thin Line Icon Container */}
                <div className="w-12 h-12 rounded-full border border-muted-gold/45 flex items-center justify-center bg-card text-muted-gold mb-4 shadow-xs">
                  <IconComponent className="w-5 h-5 stroke-[1.25]" />
                </div>

                {/* Badge title */}
                <h3 className="font-serif text-sm text-primary-text font-semibold mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-[10px] font-sans font-light text-secondary-text leading-relaxed max-w-[180px]">
                  {item.description}
                </p>
              </FadeIn>
            );
          })}
        </div>

      </div>
    </section>
  );
}

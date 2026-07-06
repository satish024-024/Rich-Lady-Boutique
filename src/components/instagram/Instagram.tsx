"use client";

import React from "react";
import { Instagram } from "lucide-react";
import { instagramData } from "@/data/instagram";
import { brandInfo } from "@/data/brand";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

import Script from "next/script";

export function InstagramSection() {
  return (
    <section
      className="w-full py-[120px] md:py-[90px] sm:py-[70px] bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="instagram"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Social Feed
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-1">
            From Instagram
          </h2>
          <a
            href={brandInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-sans tracking-widest text-secondary-text hover:text-muted-gold transition-colors font-light"
          >
            {brandInfo.instagramHandle}
          </a>
          <div className="w-12 h-[1px] bg-muted-gold/40 mt-4" />
        </FadeIn>

        {/* Live Instagram Widget - layout match */}
        <div className="w-full">
          <div className="elfsight-app-de4f85bc-22ca-4861-a2ef-a8d4319b26f5" data-elfsight-app-lazy />
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

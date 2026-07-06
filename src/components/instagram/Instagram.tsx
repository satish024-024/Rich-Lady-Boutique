"use client";

import React from "react";
import { Instagram } from "lucide-react";
import { instagramData } from "@/data/instagram";
import { brandInfo } from "@/data/brand";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

export function InstagramSection() {
  const handleReelClick = (id: string) => {
    toast.info(`Opening Instagram Reel ${id}... (Instagram API Integration Coming Soon)`);
  };

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

        {/* Layout: Reels Grid + Side Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {/* Reels Grid (left 3/4) */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {instagramData.map((post, idx) => (
              <FadeIn
                key={post.id}
                delay={idx * 0.06}
                duration="slow"
                className="relative aspect-[9/16] bg-card rounded-xs overflow-hidden border border-border-accent/30 group cursor-pointer shadow-xs hover:shadow-md transition-all duration-medium"
              >
                <div onClick={() => handleReelClick(post.id)} className="w-full h-full relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt={`Instagram Post ${post.id}`}
                    className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                  />
                  
                  {/* Video Indicator Overlay (Play Icon) */}
                  {post.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-chocolate/10 group-hover:bg-chocolate/20 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-primary-bg/85 backdrop-blur-xs flex items-center justify-center text-forest-green shadow-xs group-hover:scale-105 transition-transform duration-medium">
                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Soft Hover Overlay */}
                  <div className="absolute inset-0 bg-[#2D221C]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                {/* Future: Real-time Instagram Graph API integration for Reels feed */}
              </FadeIn>
            ))}
          </div>

          {/* CTA Card (right 1/4) */}
          <FadeIn
            delay={0.25}
            duration="slow"
            className="lg:col-span-1 bg-secondary-bg/60 border border-border-accent/40 p-8 rounded-md flex flex-col justify-between items-center text-center relative overflow-hidden group min-h-[300px] lg:min-h-0"
          >
            {/* Elegant botanical outline drawing in background */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 opacity-15 pointer-events-none text-muted-gold group-hover:scale-105 transition-transform duration-slow">
              <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M10 90 Q30 50 80 10 M80 10 Q50 30 10 90 M40 50 C30 40 20 50 10 70 M60 30 C50 20 40 30 20 60" strokeLinecap="round" />
              </svg>
            </div>

            <div className="my-auto flex flex-col items-center">
              <h3 className="font-serif text-lg text-primary-text font-normal mb-4">
                Love what you see?
              </h3>
              
              <p className="font-sans text-xs text-secondary-text leading-relaxed font-light mb-8 max-w-[200px]">
                Tap on any reel to explore the product. Follow us on Instagram for daily collection updates.
              </p>

              <a
                href={brandInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-6 py-3 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/30 hover:border-muted-gold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Instagram className="w-3.5 h-3.5 text-muted-gold" />
                Follow Us
              </a>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

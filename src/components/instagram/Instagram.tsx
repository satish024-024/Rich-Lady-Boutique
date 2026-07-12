"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Eye, ArrowRight } from "lucide-react";
import { instagramData } from "@/data/instagram";
import { brandInfo } from "@/data/brand";
import { FadeIn } from "@/components/motion/FadeIn";

export function InstagramSection() {
  const [reels, setReels] = useState<any[]>(instagramData);
  const [hoveredReel, setHoveredReel] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  useEffect(() => {
    fetch("/api/instagram/reels")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reels) {
          setReels(data.reels);
        }
      })
      .catch((err) => console.error("Error loading instagram reels:", err));
  }, []);

  const handleMouseEnter = (id: string) => {
    setHoveredReel(id);
    const video = videoRefs.current[id];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (id: string) => {
    setHoveredReel(null);
    const video = videoRefs.current[id];
    if (video) {
      video.pause();
    }
  };

  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden select-none border-b border-border-accent/40"
      id="instagram"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Seasonal Reels
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-1">
            Instagram Gallery
          </h2>
          <a
            href={brandInfo.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-sans tracking-widest text-secondary-text hover:text-muted-gold transition-colors font-light"
          >
            {brandInfo.instagramHandle}
          </a>
          <div className="w-12 h-[1px] bg-muted-gold/45 mt-4" />
        </FadeIn>

        {/* Bespoke local reels grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {reels.map((reel, idx) => (
            <FadeIn
              key={reel.id}
              delay={idx * 0.05}
              duration="slow"
              className="flex flex-col"
            >
              {/* Card Container */}
              <div
                className="w-full aspect-[9/16] bg-card border border-border-accent/35 rounded-[2rem] overflow-hidden shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-500 relative group cursor-pointer"
                onMouseEnter={() => handleMouseEnter(reel.id)}
                onMouseLeave={() => handleMouseLeave(reel.id)}
              >
                
                {/* Reel Video background - hover auto play */}
                <div className="absolute inset-0 w-full h-full bg-secondary-bg">
                  {reel.videoUrl ? (
                    <video
                      ref={(el) => { videoRefs.current[reel.id] = el; }}
                      src={reel.videoUrl}
                      poster={reel.imageUrl}
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: "translate3d(0, 0, 0)" }}
                    />
                  ) : (
                    <img src={reel.imageUrl} alt={reel.title} className="w-full h-full object-cover" />
                  )}
                  {/* Soft overlay */}
                  <div className="absolute inset-0 bg-[#3b2b24]/40 group-hover:bg-[#3b2b24]/20 transition-all duration-medium pointer-events-none" />
                </div>

                {/* Info & Action Controls */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                  
                  {/* Top strip: Play icon */}
                  <div className="flex justify-end">
                    <span className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-medium">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </div>

                  {/* Bottom strip: Title & view collection */}
                  <div className="flex flex-col items-start gap-2.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-medium">
                    <span className="text-[8px] uppercase tracking-[0.25em] text-white/70 font-bold">
                      reels capsule
                    </span>
                    <h3 className="font-serif text-base text-white font-medium leading-snug drop-shadow-xs">
                      {reel.title}
                    </h3>
                    
                    <a
                      href={reel.collectionLink}
                      className="bg-primary-bg text-primary-text hover:bg-forest-green hover:text-primary-bg px-4 py-2 text-[8px] font-sans font-bold tracking-widest uppercase rounded-full border border-border-accent/40 hover:border-forest-green transition-all duration-medium flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      View Collection
                      <ArrowRight className="w-3 h-3 text-muted-gold" />
                    </a>
                  </div>

                </div>

              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

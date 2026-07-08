"use client";

import React from "react";
import { MessageCircle, CheckCircle } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

export function Newsletter() {
  const handleJoinCommunity = () => {
    window.open("https://wa.me/919030443306?text=Hello%20Rich%20Lady%20Boutique!%20I'd%20like%20to%20join%20your%20exclusive%20WhatsApp%20community%20to%20receive%20new%20arrivals%20updates.", "_blank");
  };

  const communityBenefits = [
    "Instant New Arrivals Alerts",
    "Festival Collections Early Access",
    "Exclusive Community Offers",
    "Direct Fashion Expert Consultation"
  ];

  return (
    <section className="w-full py-16 bg-card border-b border-border-accent/40 select-none font-sans" id="whatsapp-join">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[#FAF8F3]/60 border border-border-accent/35 p-8 md:p-12 rounded-[2rem] shadow-xs flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          {/* Subtle logo silhouette bg marker */}
          <div className="absolute -left-6 -bottom-6 w-24 h-36 opacity-[0.03] pointer-events-none text-muted-gold">
            <svg viewBox="0 0 100 150" fill="currentColor">
              <path d="M50 25C44 29 38 35 36 45C34 55 35 75 35 85C35 95 38 125 50 140C62 125 65 95 65 85C65 75 66 55 64 45C62 35 56 29 50 25Z" />
            </svg>
          </div>

          {/* Left Text & Benefits */}
          <FadeIn className="flex-1 flex gap-4 items-start">
            <div className="w-12 h-12 border border-muted-gold/45 rounded-full flex items-center justify-center text-muted-gold mt-1 flex-shrink-0 bg-card shadow-xs">
              <MessageCircle className="w-5 h-5 stroke-[1.25] fill-current text-emerald-600" />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-lg md:text-xl text-primary-text font-normal">
                Join Our WhatsApp Community
              </h3>
              <p className="text-xs text-secondary-text leading-relaxed font-light max-w-sm">
                Unlock early access to designer catalog releases and special boutique edits directly inside your WhatsApp.
              </p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {communityBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-secondary-text">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Right Action Button */}
          <FadeIn delay={0.1} className="w-full md:w-auto flex-shrink-0 flex justify-center">
            <button
              onClick={handleJoinCommunity}
              className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-8 py-4 rounded-full border border-muted-gold/30 hover:border-muted-gold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-luxury text-[10px] uppercase tracking-widest font-sans font-bold"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
              Join Community
            </button>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

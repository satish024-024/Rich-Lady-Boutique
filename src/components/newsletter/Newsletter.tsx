"use client";

import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Future: Supabase email subscriptions insert
    toast.success("Thank you for subscribing to Rich Lady updates!");
    setEmail("");
  };

  return (
    <section className="w-full py-16 bg-card border-b border-border-accent/40 select-none font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-[#FAF8F3]/60 border border-border-accent/30 p-8 md:p-12 rounded-md shadow-xs flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          
          {/* Subtle logo silhouette bg marker */}
          <div className="absolute -left-6 -bottom-6 w-24 h-36 opacity-[0.03] pointer-events-none text-muted-gold">
            <svg viewBox="0 0 100 150" fill="currentColor">
              <path d="M50 25C44 29 38 35 36 45C34 55 35 75 35 85C35 95 38 125 50 140C62 125 65 95 65 85C65 75 66 55 64 45C62 35 56 29 50 25Z" />
            </svg>
          </div>

          {/* Left Text */}
          <FadeIn className="flex-1 flex gap-4 items-start">
            <div className="w-10 h-10 border border-muted-gold/40 rounded-full flex items-center justify-center text-muted-gold mt-1 flex-shrink-0">
              <Mail className="w-4 h-4 stroke-[1.25]" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-serif text-lg md:text-xl text-primary-text font-normal mb-1.5">
                Stay Updated with Rich Lady
              </h3>
              <p className="text-xs text-secondary-text leading-relaxed font-light max-w-sm">
                Get updates on new arrivals, collections, and exclusive boutique offers.
              </p>
            </div>
          </FadeIn>

          {/* Right Input Form */}
          <FadeIn delay={0.1} className="w-full md:w-auto flex-shrink-0 md:max-w-md flex-1">
            <form onSubmit={handleSubscribe} className="flex w-full border border-border-accent bg-card p-1.5 rounded-xs focus-within:border-muted-gold transition-colors">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-transparent px-3 text-xs text-primary-text placeholder-secondary-text/50 outline-none border-none focus:ring-0 focus:outline-none"
                aria-label="Email address for subscription"
              />
              <button
                type="submit"
                className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-5 py-2.5 text-[9px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
              >
                Subscribe
                <ArrowRight className="w-3 h-3 text-muted-gold" />
              </button>
            </form>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

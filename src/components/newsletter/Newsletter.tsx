"use client";

import React, { useState } from "react";
import { MessageCircle, CheckCircle, Mail, Sparkles, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleJoinCommunity = () => {
    window.open("https://wa.me/919030443306?text=Hello%20Rich%20Lady%20Boutique!%20I'd%20like%20to%20join%20your%20exclusive%20WhatsApp%20community%20to%20receive%20new%20arrivals%20updates.", "_blank");
  };

  const handleSubscribeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Subscribing you to our catalog digest...");
    try {
      const res = await fetch("/api/email/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      toast.success(data.message || "Subscribed successfully!", { id: toastId });
      setIsSubscribed(true);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete subscription", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const communityBenefits = [
    "Instant New Arrivals Alerts",
    "Festival Collections Early Access",
    "Exclusive Community Offers",
    "Direct Fashion Expert Consultation"
  ];

  return (
    <section className="w-full py-20 bg-card border-b border-border-accent/40 select-none font-sans" id="whatsapp-join">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <span className="font-serif text-[10px] tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Stay Connected
          </span>
          <h2 className="font-serif text-3xl text-primary-text font-normal">
            Boutique Updates &amp; Curations
          </h2>
          <div className="ornament-line mt-4">
            <span className="ornament-diamond" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: WhatsApp Community */}
          <FadeIn className="bg-[#FAF8F3]/60 border border-border-accent/35 p-8 md:p-10 rounded-[2rem] shadow-xs flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute -left-6 -bottom-6 w-24 h-36 opacity-[0.03] pointer-events-none text-muted-gold">
              <svg viewBox="0 0 100 150" fill="currentColor">
                <path d="M50 25C44 29 38 35 36 45C34 55 35 75 35 85C35 95 38 125 50 140C62 125 65 95 65 85C65 75 66 55 64 45C62 35 56 29 50 25Z" />
              </svg>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-muted-gold/45 rounded-full flex items-center justify-center text-muted-gold flex-shrink-0 bg-card shadow-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600 fill-current" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-lg text-primary-text font-medium">
                  Join Our WhatsApp Community
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed font-light max-w-sm">
                  Unlock instant access to designer catalog releases and special boutique edits directly inside your WhatsApp.
                </p>
              </div>
            </div>

            {/* Benefits list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 mt-2 bg-card/40 border border-border-accent/20 p-4 rounded-xl">
              {communityBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-semibold text-secondary-text">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleJoinCommunity}
              className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg w-full py-3.5 rounded-full border border-muted-gold/30 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-[10px] uppercase tracking-widest font-sans font-bold mt-4"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-current" />
              Join Community Chat
            </button>
          </FadeIn>

          {/* Card 2: Email Newsletter */}
          <FadeIn delay={0.1} className="bg-[#FAF8F3]/60 border border-border-accent/35 p-8 md:p-10 rounded-[2rem] shadow-xs flex flex-col justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-36 opacity-[0.03] pointer-events-none text-muted-gold">
              <svg viewBox="0 0 100 150" fill="currentColor">
                <path d="M50 25C44 29 38 35 36 45C34 55 35 75 35 85C35 95 38 125 50 140C62 125 65 95 65 85C65 75 66 55 64 45C62 35 56 29 50 25Z" />
              </svg>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 border border-muted-gold/45 rounded-full flex items-center justify-center text-muted-gold flex-shrink-0 bg-card shadow-xs">
                <Mail className="w-4 h-4 text-muted-gold" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-lg text-primary-text font-medium">
                  Subscribe to Editorial Digest
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed font-light max-w-sm">
                  Receive curations of our finest weaves, natural handlooms, behind-the-scenes artisan stories, and exclusive digital collections.
                </p>
              </div>
            </div>

            {/* Email form container */}
            <div className="flex flex-col justify-center flex-grow py-2">
              {isSubscribed ? (
                <div className="bg-emerald-50/55 border border-emerald-100 p-6 rounded-xl text-center flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  <div>
                    <h4 className="font-serif text-sm text-primary-text font-semibold">Subscription Confirmed!</h4>
                    <p className="text-[10px] text-secondary-text mt-1">We have sent a confirmation digest to your inbox.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribeEmail} className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-card border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg w-full py-3.5 rounded-full border border-muted-gold/30 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm text-[10px] uppercase tracking-widest font-sans font-bold disabled:opacity-50"
                  >
                    Subscribe to Newsletter
                  </button>
                </form>
              )}
            </div>

            <div className="text-[9px] uppercase tracking-wider text-center text-secondary-text font-medium mt-1">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-muted-gold" />
              We respect your privacy. Unsubscribe at any time.
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}

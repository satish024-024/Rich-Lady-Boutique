"use client";

import React from "react";
import Link from "next/link";
import { MessageCircle, Phone, Mail, MapPin, Clock, Instagram, Facebook, Compass } from "lucide-react";
import { brandInfo } from "@/data/brand";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { isAdmin } from "@/utils/auth";

export function Footer() {
  const { user } = useAuth();
  const handleSocialClick = (platform: string) => {
    toast.info(`Opening our official ${platform} page...`);
  };

  return (
    <footer className="bg-forest-green text-primary-bg pt-20 pb-8 border-t border-muted-gold/25 relative overflow-hidden font-sans select-none">
      {/* Subtle organic pattern effect background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#B8904A_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Column 1: Story & Brand */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 border border-muted-gold/45 rounded-full flex items-center justify-center bg-forest-green p-1">
                <svg viewBox="0 0 100 100" fill="none" className="w-7 h-7 text-muted-gold">
                  <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" />
                  <path d="M50 20 C46 34 32 44 32 55 C32 66 50 74 50 74 C50 74 68 66 68 55 C68 44 54 34 50 20 Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M50 32 C41 42 37 50 37 58 C37 66 50 70 50 70" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M50 32 C59 42 63 50 63 58 C63 66 50 70 50 70" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base md:text-lg tracking-widest text-primary-bg uppercase leading-none">
                  Rich Lady
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-muted-gold mt-0.5">
                  Boutique
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-primary-bg/75 leading-relaxed font-light pr-4">
              Since 2011, we are committed to curating the finest collection of fashion and quality clothes at affordable prices.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              <a
                href={brandInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-primary-bg/25 flex items-center justify-center hover:border-muted-gold hover:text-muted-gold transition-colors duration-300"
                aria-label="Instagram link"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <button
                onClick={() => handleSocialClick("Facebook")}
                className="w-8 h-8 rounded-full border border-primary-bg/25 flex items-center justify-center hover:border-muted-gold hover:text-muted-gold transition-colors duration-300 cursor-pointer"
                aria-label="Facebook link"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSocialClick("Pinterest")}
                className="w-8 h-8 rounded-full border border-primary-bg/25 flex items-center justify-center hover:border-muted-gold hover:text-muted-gold transition-colors duration-300 cursor-pointer"
                aria-label="Pinterest link"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Column 2: Collections */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-gold">
              Collections
            </h4>
            <div className="flex flex-col gap-3 text-xs font-light text-primary-bg/85">
              {["Sarees", "Kurtis", "Dress Materials", "Lehengas", "Gowns", "Accessories", "New Arrivals", "Sale"].map((col) => (
                <Link key={col} href="/catalog" className="hover:text-muted-gold transition-colors">
                  {col}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Customer Care */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-gold">
              Customer Care
            </h4>
            <div className="flex flex-col gap-3 text-xs font-light text-primary-bg/85 font-sans">
              {["Track Order", "Shipping & Delivery", "Returns & Exchanges", "FAQs", "Privacy Policy", "Terms & Conditions"].map((col) => (
                <button
                  key={col}
                  onClick={() => toast.info(`${col} helper is not active in this storefront demo.`)}
                  className="text-left hover:text-muted-gold transition-colors cursor-pointer"
                >
                  {col}
                </button>
              ))}
              {isAdmin(user) && (
                <Link href="/admin" className="text-left hover:text-muted-gold transition-colors font-medium text-muted-gold border-t border-primary-bg/10 pt-2 mt-1">
                  Admin Panel Control
                </Link>
              )}
            </div>
          </div>

          {/* Column 4: Visit Our Store */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-gold">
              Visit Our Store
            </h4>
            <div className="flex flex-col gap-4 text-xs font-light text-primary-bg/85">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-muted-gold mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">
                  {brandInfo.location}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <Clock className="w-4 h-4 text-muted-gold mt-0.5 flex-shrink-0" />
                <span>
                  {brandInfo.storeTimings}
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <Compass className="w-4 h-4 text-muted-gold mt-0.5 flex-shrink-0" />
                <span>Wholesale & Retail</span>
              </div>
            </div>
          </div>

          {/* Column 5: Get In Touch */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-gold">
              Get In Touch
            </h4>
            <div className="flex flex-col gap-4 text-xs font-light text-primary-bg/85">
              <a href={`tel:${brandInfo.phone}`} className="flex gap-3 items-center hover:text-muted-gold transition-colors">
                <Phone className="w-4 h-4 text-muted-gold flex-shrink-0" />
                <span>{brandInfo.phone}</span>
              </a>
              <a href={`mailto:${brandInfo.email}`} className="flex gap-3 items-center hover:text-muted-gold transition-colors">
                <Mail className="w-4 h-4 text-muted-gold flex-shrink-0" />
                <span>{brandInfo.email}</span>
              </a>
              <a
                href={brandInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 items-center hover:text-muted-gold transition-colors"
              >
                <Instagram className="w-4 h-4 text-muted-gold flex-shrink-0" />
                <span>{brandInfo.instagramHandle}</span>
              </a>
              
              <a
                href={brandInfo.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-2.5 px-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/30 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              >
                <MessageCircle className="w-4 h-4 text-muted-gold" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-[1px] bg-primary-bg/10 my-8" />

        {/* Bottom copyright row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-widest uppercase text-primary-bg/50">
          <p>© {new Date().getFullYear()} {brandInfo.officialName}. All rights reserved.</p>
          <p>Designed with elegance, for every woman.</p>
        </div>
      </div>
    </footer>
  );
}

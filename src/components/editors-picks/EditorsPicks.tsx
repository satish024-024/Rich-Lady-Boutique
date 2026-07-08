"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";

export function EditorsPicks() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const all = getLocalProducts();
    // Select 3 unique products for editor's picks
    setProducts(all.slice(1, 4));
  }, []);

  if (products.length < 3) return null;

  const mainProd = products[0];
  const sideProds = products.slice(1, 3);

  return (
    <section
      className="w-full py-20 bg-primary-bg overflow-hidden border-b border-border-accent/40 select-none"
      id="editors-picks"
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Magazine Editorial
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-4">
            Editor's Picks
          </h2>
          <div className="ornament-line">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        {/* Asymmetric Magazine-Style Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Left Column (Col Span 7): Big Feature Card */}
          <div className="lg:col-span-7 flex flex-col">
            <FadeIn
              delay={0.1}
              duration="slow"
              className="flex-1 bg-card border border-border-accent/35 rounded-[2rem] overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-500"
            >
              {/* Product Image */}
              <Link href={`/product/${mainProd.id}`} className="block relative aspect-[4/3] w-full overflow-hidden bg-secondary-bg">
                <img
                  src={mainProd.imageUrl}
                  alt={mainProd.name}
                  className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-forest-green text-primary-bg px-3 py-1 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider border border-muted-gold/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-muted-gold" /> Editor's Choice
                </div>
              </Link>

              {/* Text Info */}
              <div className="p-8 flex flex-col items-start gap-3">
                <span className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-muted-gold">
                  {mainProd.category} • {mainProd.fabric || "Pure Handloom"}
                </span>
                <h3 className="font-serif text-xl md:text-2xl text-primary-text font-medium leading-snug group-hover:text-muted-gold transition-colors duration-medium">
                  {mainProd.name}
                </h3>
                <p className="text-secondary-text font-sans font-light text-xs leading-relaxed max-w-md">
                  {mainProd.description || "A timeless ensemble detailed with traditional embroidery and tailored to grace any celebration."}
                </p>
                <div className="flex justify-between items-center w-full mt-4 border-t border-border-accent/25 pt-4">
                  <span className="text-sm font-sans text-chocolate font-semibold">
                    ₹{mainProd.price.toLocaleString("en-IN")}
                  </span>
                  <Link href={`/product/${mainProd.id}`} className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-forest-green hover:text-muted-gold transition-colors">
                    View Design <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column (Col Span 5): Stacked Side Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {sideProds.map((prod, idx) => (
              <FadeIn
                key={prod.id}
                delay={0.15 * (idx + 1)}
                duration="slow"
                className="flex-1 bg-card border border-border-accent/35 rounded-[2rem] overflow-hidden flex flex-col group shadow-xs hover:shadow-luxury hover:border-muted-gold/45 transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row h-full items-stretch">
                  
                  {/* Thumbnail Left */}
                  <Link href={`/product/${prod.id}`} className="w-full md:w-2/5 aspect-[4/5] md:aspect-auto overflow-hidden bg-secondary-bg relative block">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-105 absolute inset-0"
                    />
                  </Link>

                  {/* Text Right */}
                  <div className="w-full md:w-3/5 p-6 flex flex-col justify-between items-start gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-muted-gold">
                        {prod.category}
                      </span>
                      <h4 className="font-serif text-sm md:text-base text-primary-text font-medium group-hover:text-muted-gold transition-colors duration-medium line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full border-t border-border-accent/25 pt-3 mt-2">
                      <span className="text-xs font-sans text-chocolate font-semibold">
                        ₹{prod.price.toLocaleString("en-IN")}
                      </span>
                      <Link href={`/product/${prod.id}`} className="flex items-center gap-1 text-[8px] uppercase tracking-[0.2em] font-sans font-bold text-forest-green hover:text-muted-gold transition-colors">
                        View Design <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                </div>
              </FadeIn>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";

export function HomepageView() {
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(1);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings?id=homepage_hero");
      const result = await res.json();
      if (result.success && result.data) {
        setHeroHeading(result.data.heroHeading || "");
        setHeroSubheading(result.data.heroSubheading || "");
        setWhatsappLink(result.data.whatsappLink || "");
        if (result.data.version) {
          setVersion(result.data.version);
        }
      }
    } catch (err) {
      toast.error("Failed to load hero settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "homepage_hero",
          type: "hero",
          content: {
            heroHeading,
            heroSubheading,
            whatsappLink
          },
          version
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Homepage banner copy updated!");
        if (result.data?.version) {
          setVersion(result.data.version);
        }
        // Save locally to keep instant sync response
        localStorage.setItem("rich-lady-site-copy", JSON.stringify({
          heroHeading,
          heroSubheading,
          whatsappLink
        }));
      } else {
        toast.error(result.error?.message || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Network error saving copy updates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Edit Copy Panel */}
      <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-muted-gold" />
          Homepage Hero & Copy Editor
        </h3>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              Hero Heading Copy
            </label>
            <input 
              type="text" 
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="e.g. Timeless Indian Craftsmanship..."
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              Subheading copy description
            </label>
            <textarea 
              value={heroSubheading}
              onChange={(e) => setHeroSubheading(e.target.value)}
              rows={3}
              placeholder="Enter product description paragraph..."
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              WhatsApp Link Call-to-Action
            </label>
            <input 
              type="text" 
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://wa.me/919030443306"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>

          <div className="flex justify-between items-center mt-2 border-t border-border-accent/20 pt-4">
            <span className="text-[10px] text-secondary-text/80">Active Snapshot Version: <strong>{version}</strong></span>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-forest-green text-primary-bg text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-forest-green/90 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Saving changes..." : "Save Copy Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Guide details */}
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h4 className="font-serif text-sm text-primary-text font-bold mb-2">Live Storefront Sync</h4>
        <p className="text-xs text-secondary-text leading-relaxed font-light mb-4">
          Changes committed here trigger a tag-based cache revalidation on the Next.js server instance.
        </p>
        <div className="p-4 bg-muted-gold/5 border border-muted-gold/20 rounded-xl text-[10px] text-secondary-text/90 leading-relaxed">
          <strong>Optimistic Locking Active</strong>: Prevents accidental schema overwrites if multiple admin panels edit the website simultaneously.
        </div>
      </div>
    </FadeIn>
  );
}

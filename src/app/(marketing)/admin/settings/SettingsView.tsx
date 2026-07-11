"use client";

import React, { useState, useEffect } from "react";
import { Settings, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";

export function SettingsView() {
  const [boutiqueEmail, setBoutiqueEmail] = useState("");
  const [boutiqueAddress, setBoutiqueAddress] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(1);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings?id=general_branding");
      const result = await res.json();
      if (result.success && result.data) {
        setBoutiqueEmail(result.data.boutiqueEmail || "");
        setBoutiqueAddress(result.data.boutiqueAddress || "");
        setInstagramHandle(result.data.instagramHandle || "");
        if (result.data.version) {
          setVersion(result.data.version);
        }
      }
    } catch (err) {
      toast.error("Failed to load branding settings");
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
          id: "general_branding",
          type: "branding",
          content: {
            boutiqueEmail,
            boutiqueAddress,
            instagramHandle
          },
          version
        })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Branding settings saved successfully!");
        if (result.data?.version) {
          setVersion(result.data.version);
        }
      } else {
        toast.error(result.error?.message || "Failed to save settings");
      }
    } catch (err) {
      toast.error("Network error saving branding settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Form */}
      <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3 flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-gold" />
          General Branding Settings
        </h3>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              Boutique Contact Email
            </label>
            <input 
              type="email" 
              value={boutiqueEmail}
              onChange={(e) => setBoutiqueEmail(e.target.value)}
              placeholder="admin@richladyboutique.com"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              Instagram Profile Handle
            </label>
            <input 
              type="text" 
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              placeholder="@RichLadyBoutique"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">
              Physical Boutique Address
            </label>
            <textarea 
              value={boutiqueAddress}
              onChange={(e) => setBoutiqueAddress(e.target.value)}
              rows={3}
              placeholder="Street name, City, State, ZIP..."
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl focus:border-muted-gold outline-none resize-none"
            />
          </div>

          <div className="flex justify-between items-center mt-2 border-t border-border-accent/20 pt-4">
            <span className="text-[10px] text-secondary-text/80">Active version identifier: <strong>{version}</strong></span>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-forest-green text-primary-bg text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-forest-green/90 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar explanation */}
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h4 className="font-serif text-sm text-primary-text font-bold mb-2">Boutique Configuration</h4>
        <p className="text-xs text-secondary-text leading-relaxed font-light">
          These details are read in page footers, invoice emails, and checkout contact forms throughout the site. Keep details accurate.
        </p>
      </div>
    </FadeIn>
  );
}

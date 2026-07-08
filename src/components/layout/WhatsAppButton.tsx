"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 4 seconds
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppChat = () => {
    window.open("https://wa.me/919030443306?text=Hello%20Rich%20Lady%20Boutique!%20I'm%20looking%20at%20your%20website%20and%20need%20help%20choosing%20a%20design.", "_blank");
  };

  return (
    <div className="hidden md:block fixed bottom-8 right-8 z-40">
      <div className="relative flex items-center justify-end">
        {/* Tooltip Prompt */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              onClick={handleWhatsAppChat}
              className="absolute right-16 mr-2 bg-primary-bg border border-border-accent/40 rounded-full px-5 py-2.5 shadow-luxury cursor-pointer whitespace-nowrap text-xs font-sans text-primary-text font-medium hover:border-muted-gold flex items-center gap-2 hover:shadow-xl transition-all duration-medium"
            >
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
              <span>Need Help Choosing? Chat with our Fashion Expert</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Round CTA Button */}
        <motion.button
          onClick={handleWhatsAppChat}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-forest-green hover:bg-[#1a2b24] text-primary-bg rounded-full shadow-luxury hover:shadow-2xl border border-muted-gold/20 flex items-center justify-center cursor-pointer transition-all duration-medium relative group"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-muted-gold group-hover:text-primary-bg transition-colors duration-medium fill-current" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-primary-bg" />
        </motion.button>
      </div>
    </div>
  );
}

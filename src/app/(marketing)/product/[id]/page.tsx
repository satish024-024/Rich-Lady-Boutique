"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, MessageCircle, ArrowLeft, Share2, ZoomIn, Move, Maximize2, Download, FileText, Sparkles, CheckCircle, HelpCircle, CreditCard, X } from "lucide-react";
import { getLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { toast } from "sonner";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const productId = resolvedParams.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(""); // Default to empty so they must choose!
  const [isLiked, setIsLiked] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  // Simulation interactive states
  const [interactionMode, setInteractionMode] = useState<"zoom" | "pan" | "fullscreen">("zoom");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeBoutiqueModal, setActiveBoutiqueModal] = useState<"none" | "lookbook" | "care" | "sizing">("none");

  useEffect(() => {
    const products = getLocalProducts();
    const found = products.find((p) => p.id === productId);

    if (found) {
      setProduct(found);
      setSelectedImage(found.imageUrl);
      
      // Gallery (vertical strip on left of picture frame)
      const related = products.filter((p) => p.category === found.category && p.id !== found.id);
      const galleryImages = [found.imageUrl, ...related.map((p) => p.imageUrl)].slice(0, 4);
      setGallery(galleryImages);

      // Recommendations
      const recs = products.filter((p) => p.id !== found.id).slice(0, 4);
      setRecommendations(recs);

      // Wishlist check
      const savedWishlist = localStorage.getItem("rich-lady-wishlist");
      if (savedWishlist) {
        const items: Product[] = JSON.parse(savedWishlist);
        setIsLiked(items.some((item) => item.id === found.id));
      }
    } else {
      toast.error("Product not found");
      router.push("/catalog");
    }
  }, [productId, router]);

  const toggleWishlist = () => {
    if (!product) return;
    const saved = localStorage.getItem("rich-lady-wishlist");
    let currentList: Product[] = saved ? JSON.parse(saved) : [];
    
    const isAlreadyLiked = currentList.some(item => item.id === product.id);
    let updatedList: Product[];

    if (isAlreadyLiked) {
      updatedList = currentList.filter(item => item.id !== product.id);
      setIsLiked(false);
      toast.success(`${product.name} removed from wishlist`);
    } else {
      updatedList = [...currentList, product];
      setIsLiked(true);
      toast.success(`${product.name} added to wishlist!`);
    }

    localStorage.setItem("rich-lady-wishlist", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("wishlist-updated"));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    
    const savedCart = localStorage.getItem("rich-lady-cart");
    let currentCart: any[] = savedCart ? JSON.parse(savedCart) : [];

    const exists = currentCart.some(item => item.id === product.id && item.selectedSize === selectedSize);
    if (!exists) {
      const cartItem = {
        ...product,
        selectedSize: selectedSize
      };
      const updated = [...currentCart, cartItem];
      localStorage.setItem("rich-lady-cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cart-updated"));
      toast.success(`${product.name} (Size: ${selectedSize}) added to bag!`);
    } else {
      toast.info(`${product.name} in Size: ${selectedSize} is already in your bag`);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppConsult = () => {
    if (!product) return;
    const message = `Hello Rich Lady Boutique! I'm interested in looking at the details for "${product.name}"${selectedSize ? ` (Size: ${selectedSize})` : ""} (Price: ₹${product.price}). Can you please share more details or color variants?`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919030443306?text=${encoded}`, "_blank");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! Share it with friends.");
    }
  };

  const handleDownload = (type: "lookbook" | "care" | "sizing") => {
    setActiveBoutiqueModal(type);
  };

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-primary-bg flex items-center justify-center">
        <p className="font-serif italic text-lg text-secondary-text animate-pulse">Loading Details...</p>
      </div>
    );
  }

  // Boutique specifications based on category
  const productCode = `RL-${(product.price % 1000) + 4000}`;
  
  const specDimensions = product.category === "Sarees" 
    ? "5.5m Standard Saree" 
    : product.category === "Accessories" 
    ? "Free Size" 
    : "Standard Fit (XS - XXL)";

  const specType = product.category === "Sarees" 
    ? "Unstitched Heritage Saree" 
    : product.category === "Accessories" 
    ? "Bespoke Accessory" 
    : "Tailored Premium Dress";

  const specWeave = product.category === "Sarees" 
    ? "Katan Silk Brocade" 
    : product.category === "Kurtis" 
    ? "Hand-embroidered Cotton" 
    : product.category === "Accessories" 
    ? "Kundan Stone Craft" 
    : "Zari Embroidered Weave";

  const specCraftTime = product.category === "Sarees" 
    ? "72 Hours" 
    : product.category === "Accessories" 
    ? "24 Hours" 
    : "48 Hours";

  const specThreadCount = product.category === "Sarees" 
    ? "140s Double Warp" 
    : product.category === "Accessories" 
    ? "Premium Kundan Setting" 
    : "100s Egyptian Cotton";

  const specOrigin = product.category === "Sarees" 
    ? "Varanasi, India" 
    : "Rajamahendravaram, AP";

  const specGrade = "Master Artisan";

  const specCare = product.category === "Accessories" 
    ? "Store in Velvet Case" 
    : "Dry Clean Recommended";

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Dynamic Header: Breadcrumb (left) & Share Button (right) - layout match */}
        <div className="w-full flex justify-between items-center mb-10 border-b border-border-accent/30 pb-5">
          <div className="text-[10px] text-secondary-text/70 uppercase tracking-widest flex gap-2 items-center">
            <Link href="/" className="hover:text-muted-gold transition-colors font-medium">Home</Link>
            <span>&gt;</span>
            <Link href="/catalog" className="hover:text-muted-gold transition-colors font-medium">Collection</Link>
            <span>&gt;</span>
            <span className="text-secondary-text/80">{product.category}</span>
            <span>&gt;</span>
            <span className="text-primary-text font-semibold">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 border border-border-accent/40 rounded-full hover:border-muted-gold hover:text-muted-gold transition-all duration-medium text-[10px] font-sans font-semibold uppercase tracking-wider bg-card shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>

        {/* Dynamic Detail Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* LEFT SECTION (Col Span 7): Multi-image vertical list + Main Picture Frame + Action strip */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            <div className="w-full flex flex-row gap-4">
              
              {/* Vertical Thumbnail Strip - layout match */}
              {gallery.length > 1 && (
                <div className="flex flex-col gap-3 w-16 md:w-20 flex-shrink-0">
                  {gallery.map((imgUrl, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`w-full aspect-[4/5] bg-card rounded-xs border overflow-hidden cursor-pointer shadow-xs hover:border-muted-gold transition-all duration-medium ${
                        selectedImage === imgUrl ? "border-muted-gold ring-1 ring-muted-gold/20" : "border-border-accent/40"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`${product.name} Thumb ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Image Viewport with interactive frame styling - layout match */}
              <FadeIn className="flex-1 aspect-[4/5] bg-card rounded-lg border border-border-accent/40 overflow-hidden relative shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-slow ${
                    interactionMode === "zoom" ? "hover:scale-[1.08] cursor-zoom-in" : ""
                  }`}
                />

                {/* Floating Tag Overlay - layout match */}
                <div className="absolute bottom-5 right-5 bg-primary-bg/85 border border-border-accent/40 px-3 py-1.5 rounded-sm backdrop-blur-xs shadow-md text-[8px] tracking-widest uppercase font-bold text-primary-text font-sans">
                  {productCode}
                </div>
              </FadeIn>

            </div>

            {/* Photo Action Bar Strip below picture - layout match */}
            <div className="w-full bg-card border border-border-accent/35 rounded-full p-2.5 flex justify-center gap-6 shadow-xs text-[9px] uppercase tracking-wider font-semibold text-secondary-text">
              <button
                onClick={() => {
                  setInteractionMode("zoom");
                  toast.info("Hover mode activated. Hover over image to zoom.");
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${interactionMode === "zoom" ? "bg-forest-green text-primary-bg" : "hover:text-primary-text"}`}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Zoom (Hover)
              </button>
              
              <button
                onClick={() => {
                  setInteractionMode("pan");
                  toast.info("Drag mode activated. Click and hold to explore textures.");
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${interactionMode === "pan" ? "bg-forest-green text-primary-bg" : "hover:text-primary-text"}`}
              >
                <Move className="w-3.5 h-3.5" />
                Pan (Drag)
              </button>

              <button
                onClick={() => {
                  setInteractionMode("fullscreen");
                  toast.info("Fullscreen viewport simulation triggered.");
                }}
                className={`flex items-center gap-1 px-4 py-1.5 rounded-full transition-colors cursor-pointer ${interactionMode === "fullscreen" ? "bg-forest-green text-primary-bg" : "hover:text-primary-text"}`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Full Screen
              </button>
            </div>

            {/* Heritage Wardrobe Center - layout match */}
            <div className="w-full bg-card border border-border-accent/40 rounded-lg p-6 flex flex-col gap-4 shadow-xs mt-3">
              <h3 className="font-serif text-sm text-primary-text font-semibold tracking-wide">
                Heritage Wardrobe Center
              </h3>
              <p className="text-[10px] text-secondary-text font-light leading-relaxed">
                Download our seasonal catalog lookbook, print garment care guides, or access our sizing charts.
              </p>
              <div className="grid grid-cols-3 gap-3 mt-1">
                <button
                  onClick={() => handleDownload("lookbook")}
                  className="flex items-center justify-center gap-1.5 border border-border-accent py-3 rounded-full hover:border-muted-gold hover:text-muted-gold transition-colors text-[9px] uppercase tracking-wider font-semibold text-secondary-text cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Lookbook Catalog
                </button>
                <button
                  onClick={() => handleDownload("care")}
                  className="flex items-center justify-center gap-1.5 border border-border-accent py-3 rounded-full hover:border-muted-gold hover:text-muted-gold transition-colors text-[9px] uppercase tracking-wider font-semibold text-secondary-text cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Care Guide (PDF)
                </button>
                <button
                  onClick={() => handleDownload("sizing")}
                  className="flex items-center justify-center gap-1.5 border border-border-accent py-3 rounded-full hover:border-muted-gold hover:text-muted-gold transition-colors text-[9px] uppercase tracking-wider font-semibold text-secondary-text cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  Sizing Chart
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (Col Span 5): Detail specification cards - layout match */}
          <FadeIn delay={0.15} className="lg:col-span-5 flex flex-col items-start gap-6">
            
            {/* Headers */}
            <div className="flex flex-col items-start w-full">
              <span className="text-[9px] uppercase tracking-widest text-muted-gold font-bold font-sans mb-1">
                Boutique Details
              </span>
              <h1 className="font-serif text-3xl md:text-4xl text-primary-text font-normal mb-2 leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-[10px] text-secondary-text/80 tracking-wider uppercase font-semibold font-sans mt-1">
                <span>Code: <b className="text-primary-text font-bold">{productCode}</b></span>
                <span>•</span>
                <span>Category: <b className="text-primary-text font-bold">{product.category}</b></span>
                <span>•</span>
                <span>Collection: <b className="text-primary-text font-bold">Couture</b></span>
              </div>
            </div>

            {/* CARD 1: Product Specifications Metadata Table - layout match */}
            <div className="w-full bg-card border border-border-accent/40 rounded-lg p-5 shadow-xs text-xs">
              <div className="flex flex-col gap-3 font-sans">
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Product Name</span>
                  <span className="font-medium text-primary-text text-right">{product.name}</span>
                </div>
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Fabric Size</span>
                  <span className="font-medium text-primary-text text-right">{specDimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-secondary-text">Garment Type</span>
                  <span className="font-medium text-primary-text text-right">{specType}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: Technical Specifications Metadata Table - layout match */}
            <div className="w-full bg-card border border-border-accent/40 rounded-lg p-5 shadow-xs text-xs">
              <h4 className="font-serif text-xs text-muted-gold font-semibold uppercase tracking-wider mb-4">
                Weave &amp; Fabric Details
              </h4>
              <div className="flex flex-col gap-3 font-sans">
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Weaving Style</span>
                  <span className="font-medium text-primary-text text-right">{specWeave}</span>
                </div>
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Estimated Craft Time</span>
                  <span className="font-medium text-primary-text text-right">{specCraftTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-secondary-text">Thread Count</span>
                  <span className="font-medium text-primary-text text-right">{specThreadCount}</span>
                </div>
              </div>
            </div>

            {/* Large Price - layout match */}
            <div className="w-full text-left py-2">
              <span className="font-sans text-3xl font-bold text-chocolate">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            </div>

            {/* CARD 3: Manufacturing Specifications Metadata Table - layout match */}
            <div className="w-full bg-card border border-border-accent/40 rounded-lg p-5 shadow-xs text-xs">
              <div className="flex flex-col gap-3 font-sans">
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Artisan Origin</span>
                  <span className="font-medium text-primary-text text-right">{specOrigin}</span>
                </div>
                <div className="flex justify-between border-b border-border-accent/25 pb-2.5">
                  <span className="font-semibold text-secondary-text">Craftsmanship Grade</span>
                  <span className="font-medium text-primary-text text-right">{specGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-secondary-text">Care Standard</span>
                  <span className="font-medium text-primary-text text-right">{specCare}</span>
                </div>
              </div>
            </div>

            {/* Size Selector - Custom detailed layout match */}
            <div className="w-full flex flex-col items-start gap-3 mt-4 border-t border-border-accent/25 pt-6">
              <div className="flex justify-between items-center w-full">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-gold">Select Size</span>
                {selectedSize ? (
                  <span className="text-[10px] text-primary-text font-bold bg-secondary-bg px-2.5 py-0.5 rounded-full border border-border-accent/40">
                    Size: {selectedSize}
                  </span>
                ) : (
                  <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Please choose a size
                  </span>
                )}
              </div>
              
              {/* Kids Sizes Group */}
              <div className="flex flex-col gap-2 w-full mt-1.5">
                <span className="text-[8px] uppercase tracking-[0.25em] text-secondary-text/60 font-bold">Kids Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {["Kids (4-6Y)", "Kids (7-9Y)", "Kids (10-12Y)"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 rounded-full border text-[9px] uppercase font-semibold tracking-wider transition-all duration-medium cursor-pointer ${
                        selectedSize === sz
                          ? "bg-forest-green text-primary-bg border-forest-green shadow-xs"
                          : "bg-card border-border-accent/40 text-primary-text hover:border-muted-gold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Adults/Standard Sizes Group */}
              <div className="flex flex-col gap-2 w-full mt-2">
                <span className="text-[8px] uppercase tracking-[0.25em] text-secondary-text/60 font-bold">Adult Standard &amp; Plus Sizes</span>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-10 h-10 rounded-full border text-[10px] font-bold transition-all duration-medium cursor-pointer flex items-center justify-center ${
                        selectedSize === sz
                          ? "bg-forest-green text-primary-bg border-forest-green shadow-sm"
                          : "bg-card border-border-accent/40 text-primary-text hover:border-muted-gold"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Size & Action Buttons */}
            <div className="w-full flex flex-col gap-3 mt-4">
              
              {/* Buy Now Button (Razorpay Checkout) */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#0b162f] hover:bg-[#152449] text-white py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CreditCard className="w-4 h-4 text-blue-400" />
                Buy Now (Razorpay Secure)
              </button>

              {/* Add to Bag and Wishlist Grid */}
              <div className="grid grid-cols-12 gap-3 w-full">
                <button
                  onClick={handleAddToCart}
                  className="col-span-10 bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-4 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-gold" />
                  Add to Bag
                </button>
                
                <button
                  onClick={toggleWishlist}
                  className="col-span-2 border border-border-accent/40 hover:border-red-700 hover:text-red-700 rounded-full flex items-center justify-center bg-card shadow-xs transition-colors cursor-pointer text-secondary-text"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-red-700 text-red-700" : ""}`} />
                </button>
              </div>

              {/* WhatsApp consultation CTA */}
              <button
                onClick={handleWhatsAppConsult}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-primary-bg py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-muted-gold fill-current" />
                Consult on WhatsApp
              </button>
            </div>

          </FadeIn>

        </div>

        {/* You May Also Like Slider */}
        {recommendations.length > 0 && (
          <div className="w-full border-t border-border-accent/30 pt-16 mt-8">
            <h2 className="font-serif text-2xl text-primary-text font-normal mb-10 text-center tracking-tight">
              You May Also Like
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {recommendations.map((prod, idx) => (
                <FadeIn
                  key={prod.id}
                  delay={idx * 0.05}
                  duration="slow"
                  className="flex flex-col items-start group relative"
                >
                  <Link href={`/product/${prod.id}`} className="w-full flex flex-col items-start cursor-pointer">
                    <div className="w-full aspect-[4/5] bg-card overflow-hidden border border-border-accent/30 relative group shadow-xs hover:shadow-md transition-all duration-medium rounded-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover transition-transform duration-slow group-hover:scale-[1.02]"
                      />
                    </div>

                    <h3 className="font-serif text-xs md:text-sm text-primary-text font-normal mt-5 mb-1 group-hover:text-muted-gold transition-colors duration-medium">
                      {prod.name}
                    </h3>
                    <span className="text-xs font-sans text-chocolate font-semibold">
                      ₹{prod.price.toLocaleString("en-IN")}
                    </span>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RENDER MODAL 1: Razorpay Checkout Dialog */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        totalAmount={product.price}
        isCartCheckout={false}
      />

      {/* RENDER MODAL 2: Lookbook Catalog Overlay */}
      <AnimatePresence>
        {activeBoutiqueModal === "lookbook" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBoutiqueModal("none")}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-xl bg-primary-bg border border-border-accent/40 rounded-[2rem] shadow-luxury z-50 overflow-hidden font-sans p-6 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-border-accent/25 pb-4 mb-4">
                <span className="font-serif text-base text-primary-text font-semibold">Seasonal Lookbook Catalog</span>
                <button onClick={() => setActiveBoutiqueModal("none")} className="p-1 rounded-full hover:bg-secondary-bg text-secondary-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 text-xs pr-2">
                <p className="text-secondary-text font-light leading-relaxed">
                  Explore preview designs from our latest artisan collection. Handcrafted with precision by master weavers across Rajamahendravaram.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {gallery.map((img, i) => (
                    <div key={i} className="aspect-[4/5] rounded-lg overflow-hidden border border-border-accent/30 shadow-xs relative group bg-card">
                      <img src={img} alt="Lookbook design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-medium" />
                      <div className="absolute bottom-2 left-2 bg-primary-bg/85 px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-semibold border border-border-accent/45">
                        Plate {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RENDER MODAL 3: Care Guide Overlay */}
      <AnimatePresence>
        {activeBoutiqueModal === "care" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBoutiqueModal("none")}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-md bg-primary-bg border border-border-accent/40 rounded-[2rem] shadow-luxury z-50 overflow-hidden font-sans p-6"
            >
              <div className="flex justify-between items-center border-b border-border-accent/25 pb-4 mb-4">
                <span className="font-serif text-base text-primary-text font-semibold">Fabric Care Guide (PDF)</span>
                <button onClick={() => setActiveBoutiqueModal("none")} className="p-1 rounded-full hover:bg-secondary-bg text-secondary-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4 text-xs">
                <p className="text-secondary-text font-light leading-relaxed">
                  Proper maintenance ensures the timeless beauty and durability of your luxury boutique garments.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="border-l-2 border-muted-gold pl-3">
                    <span className="font-bold text-primary-text block">1. Washing Standards</span>
                    <span className="text-secondary-text font-light">Dry clean only is highly recommended for all pure silk, zari, and embroidered work. Never use strong bleaching detergents.</span>
                  </div>
                  <div className="border-l-2 border-muted-gold pl-3">
                    <span className="font-bold text-primary-text block">2. Ironing Standards</span>
                    <span className="text-secondary-text font-light">Cool iron on reverse side. Use a protective press cloth. Never iron directly over zari or heavy hand-embroidery details.</span>
                  </div>
                  <div className="border-l-2 border-muted-gold pl-3">
                    <span className="font-bold text-primary-text block">3. Storage Standards</span>
                    <span className="text-secondary-text font-light">Store in a cool, dry place wrapped in soft muslin cloth. Never hang heavy lehengas as it can warp shape. Store Kundan jewelry in air-tight velvet cases.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* RENDER MODAL 4: Sizing Chart Overlay */}
      <AnimatePresence>
        {activeBoutiqueModal === "sizing" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBoutiqueModal("none")}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-lg bg-primary-bg border border-border-accent/40 rounded-[2rem] shadow-luxury z-50 overflow-hidden font-sans p-6 max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-border-accent/25 pb-4 mb-4">
                <span className="font-serif text-base text-primary-text font-semibold">Bespoke Sizing Chart</span>
                <button onClick={() => setActiveBoutiqueModal("none")} className="p-1 rounded-full hover:bg-secondary-bg text-secondary-text">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border-accent/40 font-serif text-muted-gold font-bold">
                      <th className="py-2.5">Size</th>
                      <th className="py-2.5">Chest (in)</th>
                      <th className="py-2.5">Waist (in)</th>
                      <th className="py-2.5">Hips (in)</th>
                      <th className="py-2.5">Garment Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">Kids (4-6Y)</td>
                      <td className="py-2.5">24"</td>
                      <td className="py-2.5">22"</td>
                      <td className="py-2.5">26"</td>
                      <td className="py-2.5">28"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">Kids (7-9Y)</td>
                      <td className="py-2.5">27"</td>
                      <td className="py-2.5">25"</td>
                      <td className="py-2.5">29"</td>
                      <td className="py-2.5">34"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">Kids (10-12Y)</td>
                      <td className="py-2.5">30"</td>
                      <td className="py-2.5">28"</td>
                      <td className="py-2.5">32"</td>
                      <td className="py-2.5">40"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">XS</td>
                      <td className="py-2.5">32"</td>
                      <td className="py-2.5">26"</td>
                      <td className="py-2.5">35"</td>
                      <td className="py-2.5">44"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">S</td>
                      <td className="py-2.5">34"</td>
                      <td className="py-2.5">28"</td>
                      <td className="py-2.5">37"</td>
                      <td className="py-2.5">44"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">M</td>
                      <td className="py-2.5">36"</td>
                      <td className="py-2.5">30"</td>
                      <td className="py-2.5">39"</td>
                      <td className="py-2.5">45"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">L</td>
                      <td className="py-2.5">38"</td>
                      <td className="py-2.5">32"</td>
                      <td className="py-2.5">41"</td>
                      <td className="py-2.5">45"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">XL</td>
                      <td className="py-2.5">40"</td>
                      <td className="py-2.5">34"</td>
                      <td className="py-2.5">43"</td>
                      <td className="py-2.5">46"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">XXL</td>
                      <td className="py-2.5">42"</td>
                      <td className="py-2.5">36"</td>
                      <td className="py-2.5">45"</td>
                      <td className="py-2.5">46"</td>
                    </tr>
                    <tr className="border-b border-border-accent/15 text-secondary-text">
                      <td className="py-2.5 font-bold text-primary-text">XXXL</td>
                      <td className="py-2.5">44"</td>
                      <td className="py-2.5">38"</td>
                      <td className="py-2.5">47"</td>
                      <td className="py-2.5">46"</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] text-secondary-text mt-4 font-light leading-relaxed">
                  * All measurements are in inches. Custom stitching options are available. Reach out via WhatsApp consultation for personalized sizing configurations.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, MessageCircle, Share2, Download, FileText, CheckCircle, HelpCircle, CreditCard, X, ChevronDown, ChevronUp, Shield, Truck, Facebook, Twitter, Compass } from "lucide-react";
import { getProducts } from "@/utils/db";
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
  const [selectedSize, setSelectedSize] = useState(""); // Default empty
  const [isLiked, setIsLiked] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);

  // Interactive states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeBoutiqueModal, setActiveBoutiqueModal] = useState<"none" | "lookbook" | "care" | "sizing">("none");
  const [openSection, setOpenSection] = useState<string | null>("details"); // Accordion state
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
    getProducts().then((products) => {
      const found = products.find((p) => p.id === productId || p.slug === productId);

      if (found) {
        setProduct(found);
        
        // Gallery (vertical stack list on the left side)
        const galleryImages = [
          found.imageUrl,
          found.sideProfile1Url,
          found.sideProfile2Url
        ].filter(Boolean) as string[];

        // Fallback if no side profiles are configured
        if (galleryImages.length === 1) {
          const related = products.filter((p) => p.category === found.category && p.id !== found.id);
          galleryImages.push(
            ...related.map((p) => p.imageUrl),
            "/images/featured_everyday.jpg",
            "/images/festival_spotlight.jpg"
          );
        }
        setGallery(galleryImages.slice(0, 4));

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
    });
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

    const existingIndex = currentCart.findIndex(item => item.id === product.id && item.selectedSize === selectedSize);
    const existingQty = existingIndex > -1 ? (currentCart[existingIndex].quantity || 0) : 0;
    const requestedQty = existingQty + quantity;
    const maxAvailable = product.stock !== undefined ? product.stock : 10;

    if (requestedQty > maxAvailable) {
      toast.error(`Cannot add more items. Only ${maxAvailable} available in stock (you already have ${existingQty} in your bag).`);
      return;
    }

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity = requestedQty;
      toast.success(`Updated ${product.name} (Size: ${selectedSize}) quantity to ${requestedQty} in bag!`);
    } else {
      const cartItem = {
        ...product,
        selectedSize: selectedSize,
        quantity: quantity
      };
      currentCart.push(cartItem);
      toast.success(`${product.name} (Size: ${selectedSize}, Qty: ${quantity}) added to bag!`);
    }
    localStorage.setItem("rich-lady-cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("cart-updated"));
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

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!product) {
    return (
      <div className="w-full min-h-screen bg-primary-bg flex items-center justify-center">
        <p className="font-serif italic text-lg text-secondary-text animate-pulse">Loading Details...</p>
      </div>
    );
  }

  // Specifications metadata
  const productCode = `RL-${(product.price % 1000) + 4000}`;
  
  const specFabric = product.fabric || "Premium Handloom";

  const specDimensions = product.dimensions || (product.category === "Sarees" 
    ? "5.5m Standard Saree" 
    : product.category === "Accessories" 
    ? "Free Size" 
    : "Standard Fit (XS - XXL)");

  const specType = product.garmentCut || (product.category === "Sarees" 
    ? "Unstitched Heritage Saree" 
    : product.category === "Accessories" 
    ? "Bespoke Accessory" 
    : "Tailored Premium Dress");

  const specWeave = product.weavingStyle || (product.category === "Sarees" 
    ? "Katan Silk Brocade" 
    : product.category === "Kurtis" 
    ? "Hand-embroidered Cotton" 
    : product.category === "Accessories" 
    ? "Kundan Stone Craft" 
    : "Zari Embroidered Weave");

  const specCraftTime = product.craftTime || (product.category === "Sarees" 
    ? "72 Hours" 
    : product.category === "Accessories" 
    ? "24 Hours" 
    : "48 Hours");

  const specThreadCount = product.threadCount || (product.category === "Sarees" 
    ? "140s Double Warp" 
    : product.category === "Accessories" 
    ? "Premium Kundan Setting" 
    : "100s Egyptian Cotton");

  const specOrigin = product.artisanOrigin || (product.category === "Sarees" 
    ? "Varanasi, India" 
    : "Rajamahendravaram, AP");

  const specCare = product.washingStandard || (product.category === "Accessories" 
    ? "Store in Velvet Case" 
    : "Dry Clean Recommended");

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Breadcrumb Header */}
        <div className="w-full flex justify-between items-center mb-8 border-b border-border-accent/30 pb-5">
          <div className="text-[10px] text-secondary-text/75 uppercase tracking-widest flex gap-2 items-center">
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

        {/* Layout: Split Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
          
          {/* LEFT COLUMN (Col Span 7): Asymmetrical Editorial Image Grid */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Main Large Image */}
            {gallery.length > 0 && (
              <FadeIn
                delay={0.05}
                duration="slow"
                className="w-full aspect-[4/5] bg-card rounded-2xl border border-border-accent/45 overflow-hidden shadow-xs hover:shadow-luxury transition-all duration-500 relative"
              >
                <img
                  src={gallery[0]}
                  alt={`${product.name} Front View`}
                  className="w-full h-full object-cover transition-transform duration-slow hover:scale-105"
                />
                <div className="absolute bottom-5 right-5 bg-primary-bg/85 border border-border-accent/40 px-3.5 py-1.5 rounded-full backdrop-blur-xs text-[8px] tracking-widest uppercase font-bold text-primary-text">
                  Main View
                </div>
              </FadeIn>
            )}

            {/* 2. Two Smaller Images Side-by-Side */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-2 gap-6 w-full">
                
                {/* Thumbnail 1 */}
                <FadeIn
                  delay={0.1}
                  duration="slow"
                  className="w-full aspect-[4/5] bg-card rounded-2xl border border-border-accent/45 overflow-hidden shadow-xs hover:shadow-luxury transition-all duration-500 relative"
                >
                  <img
                    src={gallery[1]}
                    alt={`${product.name} View 2`}
                    className="w-full h-full object-cover transition-transform duration-slow hover:scale-105"
                  />
                  <div className="absolute bottom-4 right-4 bg-primary-bg/85 border border-border-accent/40 px-2.5 py-1 rounded-full backdrop-blur-xs text-[7px] tracking-widest uppercase font-bold text-primary-text">
                    Detail 1
                  </div>
                </FadeIn>

                {/* Thumbnail 2 with +More Overlay if there are 4 or more images */}
                {gallery.length > 2 && (
                  <FadeIn
                    delay={0.15}
                    duration="slow"
                    className="w-full aspect-[4/5]"
                  >
                    <div
                      onClick={() => {
                        if (gallery.length > 3) {
                          handleDownload("lookbook");
                        }
                      }}
                      className={`w-full h-full bg-card rounded-2xl border border-border-accent/45 overflow-hidden shadow-xs hover:shadow-luxury transition-all duration-500 relative ${
                        gallery.length > 3 ? "cursor-pointer group" : ""
                      }`}
                    >
                      <img
                        src={gallery[2]}
                        alt={`${product.name} View 3`}
                        className="w-full h-full object-cover transition-transform duration-slow hover:scale-105"
                      />
                      
                      {gallery.length > 3 ? (
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-white gap-1 z-10">
                          <span className="text-lg font-bold">+{gallery.length - 3}</span>
                          <span className="text-[8px] uppercase tracking-widest font-semibold">More Photos</span>
                        </div>
                      ) : (
                        <div className="absolute bottom-4 right-4 bg-primary-bg/85 border border-border-accent/40 px-2.5 py-1 rounded-full backdrop-blur-xs text-[7px] tracking-widest uppercase font-bold text-primary-text">
                          Detail 2
                        </div>
                      )}
                    </div>
                  </FadeIn>
                )}

              </div>
            )}

          </div>

          {/* RIGHT COLUMN (Col Span 5): Overhauled Buying Card matching the shared mockup */}
          <div className="lg:col-span-5 flex flex-col items-start gap-5">
            
            {/* Top row: SKU, dispatch scheduler, and inventory status */}
            <div className="flex items-center gap-2 text-[10px] tracking-wider text-secondary-text/75 font-semibold">
              <span>SKU: {productCode}</span>
              <span className="h-3 w-[1px] bg-secondary-text/20 mx-1" />
              <span>Ships in 24 Hours</span>
              <span className="h-3 w-[1px] bg-secondary-text/20 mx-1" />
              <span className={product.stock === 0 ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>
                {product.stock === 0 ? "Out of Stock" : `In Stock (${product.stock} available)`}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-serif text-3xl md:text-4xl text-primary-text font-bold leading-tight -mt-1 tracking-tight">
              {product.name}
            </h1>

            {/* Rating Stars on Platform */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-secondary-text font-sans font-semibold uppercase tracking-wider">
                18 Reviews on
              </span>
              <span className="flex text-emerald-600 text-xs font-bold items-center gap-0.5">
                <span>★</span> Rich Lady
              </span>
            </div>

            {/* Price display with discount offer details */}
            <div className="w-full flex flex-col gap-1 items-start mt-2">
              <div className="flex items-center gap-3">
                <span className="font-sans text-3xl font-bold text-[#3B2B24]">
                  MRP ₹{product.price.toLocaleString("en-IN")}
                </span>
                
                {/* Active Offer Pill */}
                <button
                  onClick={() => toast.success("Active offer code applied: FIRSTBUY (5% off at checkout)")}
                  className="bg-[#3B2B24] hover:bg-[#23352D] text-primary-bg px-2.5 py-1 text-[8px] font-sans font-bold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  Offers: 3 →
                </button>
              </div>
              <span className="text-[9px] text-secondary-text font-sans font-light">
                Inclusive of all taxes
              </span>
            </div>

            {/* Shipping badge */}
            <div className="flex items-center gap-1 text-xs font-sans">
              <span className="text-secondary-text font-semibold">Shipping:</span>
              <span className="text-red-700 font-bold tracking-wider uppercase text-[10px]">Free</span>
            </div>

            {/* Size Selector Block */}
            <div className="w-full flex flex-col gap-3 mt-3">
              <span className="text-sm font-sans font-semibold text-primary-text">Size</span>
              
              {/* Square size buttons */}
              <div className="flex flex-wrap gap-2.5">
                {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-12 h-10 border text-xs font-bold transition-all duration-medium flex items-center justify-center cursor-pointer ${
                      selectedSize === sz
                        ? "bg-forest-green text-primary-bg border-forest-green shadow-xs"
                        : "bg-[#FFFDF9]/65 border-border-accent/40 text-primary-text hover:border-muted-gold"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              {/* Sizing helpers */}
              <div className="flex gap-4 text-[9px] font-sans text-secondary-text font-medium mt-1">
                <button onClick={() => handleDownload("sizing")} className="underline hover:text-muted-gold">
                  Size Chart
                </button>
                <button onClick={() => handleDownload("care")} className="underline hover:text-muted-gold">
                  How To Measure
                </button>
              </div>
            </div>

            {/* Quantity Selector Block */}
            <div className="w-full flex flex-col gap-3 mt-4">
              <span className="text-sm font-sans font-semibold text-primary-text">Quantity</span>
              <div className="flex items-center">
                <div className="flex items-center border border-border-accent/40 bg-[#FFFDF9]/65 rounded-sm overflow-hidden h-10">
                  <button
                     onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                     disabled={quantity <= 1}
                     className="w-10 h-full flex items-center justify-center text-sm font-bold text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-primary-text select-none">
                    {quantity}
                  </span>
                  <button
                     onClick={() => setQuantity(prev => Math.min(product.stock !== undefined ? product.stock : 10, prev + 1))}
                     disabled={quantity >= (product.stock !== undefined ? product.stock : 10)}
                     className="w-10 h-full flex items-center justify-center text-sm font-bold text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Primary CTAs (Buy and Wishlist Side by Side) */}
            <div className="w-full flex flex-col gap-3 mt-4">
              
              <div className="flex gap-3 w-full items-stretch">
                {/* Add to Shopping Bag */}
                <button
                  onClick={product.stock === 0 ? undefined : handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 text-[10px] font-sans font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-sm border ${
                    product.stock === 0
                      ? "bg-secondary-bg text-secondary-text border-border-accent/40 cursor-not-allowed opacity-60"
                      : "bg-forest-green hover:bg-[#1a2b24] text-primary-bg border-muted-gold/20 hover:border-muted-gold cursor-pointer"
                  }`}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Shopping Bag"}
                  {product.stock !== 0 && <span className="text-[12px]">→</span>}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={toggleWishlist}
                  className="px-6 border border-border-accent/45 hover:border-red-700 hover:text-red-700 flex items-center justify-center bg-card shadow-xs transition-colors cursor-pointer text-secondary-text"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 mr-1.5 ${isLiked ? "fill-red-700 text-red-700" : ""}`} />
                  <span className="text-[9px] uppercase tracking-widest font-bold">Wishlist</span>
                </button>
              </div>

              {/* Pricing overview under CTAs */}
              <div className="text-[10px] text-secondary-text/80 font-sans font-medium mt-1">
                You Pay: <b className="text-primary-text">₹{(product.price * quantity).toLocaleString("en-IN")}</b> (Incl. Services)
                {quantity > 1 && (
                  <span className="text-[9px] text-secondary-text/60 font-light ml-1.5">
                    (₹{product.price.toLocaleString("en-IN")} each)
                  </span>
                )}
              </div>

              {/* Shipping policy helper */}
              <div className="text-[10px] text-secondary-text font-sans font-light leading-relaxed mt-1">
                Know our <button onClick={() => toggleSection("care")} className="text-forest-green font-semibold hover:underline">Shipping</button> and <button onClick={() => toggleSection("care")} className="text-forest-green font-semibold hover:underline">Return</button> policy. Any Questions? <button onClick={handleWhatsAppConsult} className="text-forest-green font-semibold hover:underline">Just Ask</button>
              </div>

              {/* Share Strip links */}
              <div className="flex items-center gap-2.5 text-[10px] text-secondary-text font-sans font-medium mt-2">
                <span>Share :</span>
                <button onClick={() => toast.info("Sharing on Facebook...")} className="hover:text-muted-gold text-secondary-text/75"><Facebook className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.info("Sharing on Twitter...")} className="hover:text-muted-gold text-secondary-text/75"><Twitter className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.info("Sharing on Pinterest...")} className="hover:text-muted-gold text-secondary-text/75"><Compass className="w-3.5 h-3.5" /></button>
              </div>

              {/* Secure Checkout option */}
              <button
                onClick={product.stock === 0 ? undefined : handleBuyNow}
                disabled={product.stock === 0}
                className={`w-full py-3.5 text-[9px] font-sans font-bold tracking-widest uppercase rounded-full border transition-all duration-300 flex items-center justify-center gap-2 shadow-md mt-2 ${
                  product.stock === 0
                    ? "bg-secondary-bg/50 text-secondary-text border-border-accent/40 cursor-not-allowed opacity-60"
                    : "bg-[#0b162f] hover:bg-[#152449] text-white border-blue-500/25 cursor-pointer"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                {product.stock === 0 ? "Sold Out" : "Buy Now (Razorpay Secure Checkout)"}
              </button>
            </div>

            {/* Accordion Specification Tabs (Clean spec list) */}
            <div className="w-full flex flex-col border border-border-accent/40 rounded-xl overflow-hidden shadow-xs mt-3 bg-card">
              
              {/* Tab 1: Product Details */}
              <div className="border-b border-border-accent/25">
                <button
                  onClick={() => toggleSection("details")}
                  className="w-full px-5 py-4 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-primary-text bg-card hover:bg-secondary-bg/20 transition-colors"
                >
                  <span>Product Specifications</span>
                  {openSection === "details" ? <ChevronUp className="w-4 h-4 text-muted-gold" /> : <ChevronDown className="w-4 h-4 text-muted-gold" />}
                </button>
                {openSection === "details" && (
                  <div className="px-5 pb-5 pt-1 text-xs text-secondary-text font-sans font-light flex flex-col gap-2">
                    <p className="leading-relaxed mb-2">{product.description}</p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-border-accent/20 pt-3">
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Fabric Type</span>
                        <span>{specFabric}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Dimensions</span>
                        <span>{specDimensions}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Garment Cut</span>
                        <span>{specType}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Artisan Origin</span>
                        <span>{specOrigin}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 2: Weave details */}
              <div className="border-b border-border-accent/25">
                <button
                  onClick={() => toggleSection("fabric")}
                  className="w-full px-5 py-4 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-primary-text bg-card hover:bg-secondary-bg/20 transition-colors"
                >
                  <span>Weave &amp; Craft Details</span>
                  {openSection === "fabric" ? <ChevronUp className="w-4 h-4 text-muted-gold" /> : <ChevronDown className="w-4 h-4 text-muted-gold" />}
                </button>
                {openSection === "fabric" && (
                  <div className="px-5 pb-5 pt-1 text-xs text-secondary-text font-sans font-light flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Weaving Style</span>
                        <span>{specWeave}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Estimated Craft Time</span>
                        <span>{specCraftTime}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Thread Count</span>
                        <span>{specThreadCount}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider text-muted-gold">Artisan Standard</span>
                        <span>Master Craftsmanship Grade</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 3: Care & Delivery */}
              <div>
                <button
                  onClick={() => toggleSection("care")}
                  className="w-full px-5 py-4 flex justify-between items-center text-[10px] uppercase tracking-wider font-bold text-primary-text bg-card hover:bg-secondary-bg/20 transition-colors"
                >
                  <span>Garment Care &amp; Support</span>
                  {openSection === "care" ? <ChevronUp className="w-4 h-4 text-muted-gold" /> : <ChevronDown className="w-4 h-4 text-muted-gold" />}
                </button>
                {openSection === "care" && (
                  <div className="px-5 pb-5 pt-1 text-xs text-secondary-text font-sans font-light flex flex-col gap-3">
                    <div className="flex gap-2 items-start">
                      <Shield className="w-4 h-4 text-muted-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider">Washing Standard</span>
                        <span>{specCare}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start border-t border-border-accent/15 pt-2.5">
                      <Truck className="w-4 h-4 text-muted-gold mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-primary-text block text-[9px] uppercase tracking-wider">Secure Worldwide Shipping</span>
                        <span>All shipments are double packed and insured. Easy 7-day exchange policies.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

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
        totalAmount={product.price * quantity}
        isCartCheckout={false}
        quantity={quantity}
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

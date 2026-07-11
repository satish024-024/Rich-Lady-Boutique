"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getProducts, addProduct, deleteProduct, updateProductPhoto, updateProductStock, updateProductCollectionTag, updateProductSpecs } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { Plus, Trash2, Edit3, Image as ImageIcon, Sparkles, ShoppingBag, FolderHeart, Mail, Phone, RefreshCw, Search, Tag, Sliders } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { isAdmin } from "@/utils/auth";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sarees");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/cat_sarees.jpg");
  const [sideProfile1, setSideProfile1] = useState("");
  const [sideProfile2, setSideProfile2] = useState("");
  const [activeImageSlot, setActiveImageSlot] = useState<"main" | "side1" | "side2">("main");
  const [isUploading, setIsUploading] = useState(false);
  const [collectionTag, setCollectionTag] = useState("");
  const [stock, setStock] = useState("10");

  // Specifications for new product
  const [fabric, setFabric] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [garmentCut, setGarmentCut] = useState("");
  const [artisanOrigin, setArtisanOrigin] = useState("");
  const [weavingStyle, setWeavingStyle] = useState("");
  const [craftTime, setCraftTime] = useState("");
  const [threadCount, setThreadCount] = useState("");
  const [washingStandard, setWashingStandard] = useState("");
  const [showEditorialSpecs, setShowEditorialSpecs] = useState(false);

  // Specifications Editor Modal State
  const [editingSpecsProduct, setEditingSpecsProduct] = useState<Product | null>(null);
  const [editSpecsData, setEditSpecsData] = useState({
    fabric: "",
    dimensions: "",
    garmentCut: "",
    artisanOrigin: "",
    weavingStyle: "",
    craftTime: "",
    threadCount: "",
    washingStandard: "",
  });

  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "notifications">("catalog");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Notifications Log States
  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogsCount, setTotalLogsCount] = useState(0);
  const [currentLogsPage, setCurrentLogsPage] = useState(1);
  const [filterType, setFilterType] = useState<"all" | "email" | "sms">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [logsSearchInput, setLogsSearchInput] = useState(""); // local input state before applying
  const [logCounters, setLogCounters] = useState({
    sentEmails: 0,
    failedEmails: 0,
    sentSms: 0,
    failedSms: 0,
  });
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error("Failed to load orders: " + (data.error || ""));
      }
    } catch (err: any) {
      toast.error("Network error loading orders");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const query = new URLSearchParams({
        page: String(currentLogsPage),
        limit: "10",
        type: filterType,
        status: filterStatus,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/notifications?${query}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setTotalLogsCount(data.totalCount);
        setLogCounters(data.counters);
      } else {
        toast.error("Failed to load communication logs: " + (data.error || ""));
      }
    } catch (err) {
      toast.error("Error loading notification logs");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleRetryNotification = async (logId: string, type: "email" | "sms") => {
    const toastId = toast.loading(`Retrying notification dispatch...`);
    try {
      const res = await fetch("/api/admin/notifications/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Notification resent successfully!", { id: toastId });
        await fetchLogs(); // Refresh logs
      } else {
        throw new Error(data.error || "Retry failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Resend failed", { id: toastId });
    }
  };

  const handleShipOrder = async (orderId: string) => {
    const toastId = toast.loading("Connecting to Shiprocket logistics...");
    try {
      const res = await fetch("/api/admin/ship-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Shipment created successfully!", { id: toastId });
        await fetchOrders(); // Refresh orders to show tracking details
      } else {
        throw new Error(data.error || "Failed to create shipment");
      }
    } catch (err: any) {
      toast.error(err.message || "Logistics booking failed", { id: toastId });
    }
  };

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "notifications") {
      fetchLogs();
    }
  }, [activeTab, currentLogsPage, filterType, filterStatus, searchTerm]);

  const categories = ["Sarees", "Kurtis", "Lehengas", "Gowns", "Western Wear", "Kids Wear"];

  // Preloaded boutique stock images for easy selection in the demo
  const imagePresets = [
    { label: "Saree Silk", path: "/images/cat_sarees.jpg" },
    { label: "Saree Details", path: "/images/prod_silk_saree.jpg" },
    { label: "Kurti Embroidered", path: "/images/cat_kurtis.jpg" },
    { label: "Kurti Yellow", path: "/images/prod_anarkali_kurti.jpg" },
    { label: "Lehenga Heavy", path: "/images/cat_lehengas.jpg" },
    { label: "Lehenga Velvet Maroon", path: "/images/prod_velvet_lehenga.jpg" },
    { label: "Gown Emerald Organza", path: "/images/prod_party_gown.jpg" },
    { label: "Western Wear Dress", path: "/images/cat_western.jpg" },
    { label: "Kids Wear Traditional", path: "/images/cat_kids.jpg" },
    { label: "Kids Sherwani Gold", path: "/images/prod_kids_sherwani.jpg" }
  ];

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP, etc.)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    const toastId = toast.loading("Uploading photo to storage...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Upload failed");
      }

      if (activeImageSlot === "main") {
        setImageUrl(result.url);
      } else if (activeImageSlot === "side1") {
        setSideProfile1(result.url);
      } else if (activeImageSlot === "side2") {
        setSideProfile2(result.url);
      }

      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a product name");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    const newProduct: Product = {
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name,
      price: Number(price),
      imageUrl: imageUrl.trim(),
      sideProfile1Url: sideProfile1.trim() !== "" ? sideProfile1.trim() : undefined,
      sideProfile2Url: sideProfile2.trim() !== "" ? sideProfile2.trim() : undefined,
      category,
      collectionTag: collectionTag.trim() !== "" ? collectionTag.trim() : undefined,
      rating: 5.0,
      reviewsCount: 1,
      isNewArrival: true,
      description: description.trim() !== "" ? description.trim() : `Premium quality boutique design. Woven using traditional handloom methods, offering total style and comfort.`,
      stock: Number(stock) || 0,
      fabric: fabric.trim() !== "" ? fabric.trim() : undefined,
      dimensions: dimensions.trim() !== "" ? dimensions.trim() : undefined,
      garmentCut: garmentCut.trim() !== "" ? garmentCut.trim() : undefined,
      artisanOrigin: artisanOrigin.trim() !== "" ? artisanOrigin.trim() : undefined,
      weavingStyle: weavingStyle.trim() !== "" ? weavingStyle.trim() : undefined,
      craftTime: craftTime.trim() !== "" ? craftTime.trim() : undefined,
      threadCount: threadCount.trim() !== "" ? threadCount.trim() : undefined,
      washingStandard: washingStandard.trim() !== "" ? washingStandard.trim() : undefined,
    };

    const toastId = toast.loading("Adding product to store...");
    try {
      await addProduct(newProduct);
      const updated = await getProducts();
      setProducts(updated);
      
      // Reset Form
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("/images/cat_sarees.jpg");
      setSideProfile1("");
      setSideProfile2("");
      setStock("10");
      setActiveImageSlot("main");
      setCollectionTag("");
      setFabric("");
      setDimensions("");
      setGarmentCut("");
      setArtisanOrigin("");
      setWeavingStyle("");
      setCraftTime("");
      setThreadCount("");
      setWashingStandard("");
      toast.success(`"${name}" successfully added to the catalog!`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to add: ${err.message}`, { id: toastId });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const toastId = toast.loading("Removing product...");
    try {
      await deleteProduct(id);
      const updated = await getProducts();
      setProducts(updated);
      toast.success(`Removed "${name}" from the store`, { id: toastId });
    } catch (err: any) {
      toast.error(`Delete failed: ${err.message}`, { id: toastId });
    }
  };

  const handleUpdateProductPhoto = async (id: string, newPhotoPath: string) => {
    const toastId = toast.loading("Updating product photo...");
    try {
      await updateProductPhoto(id, newPhotoPath);
      const updated = await getProducts();
      setProducts(updated);
      toast.success("Product photo updated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Photo update failed: ${err.message}`, { id: toastId });
    }
  };

  const handleResetCatalog = async () => {
    const toastId = toast.loading("Resetting catalog and seeding database...");
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (data.success) {
        const updated = await getProducts();
        setProducts(updated);
        toast.success("Catalog successfully reset and seeded in Supabase!", { id: toastId });
      } else {
        throw new Error(data.error || "Failed to seed");
      }
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`, { id: toastId });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAdmin(user)) {
        toast.error("Access Denied: You do not have administrator permissions.");
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !isAdmin(user)) {
    return (
      <div className="w-full min-h-screen bg-primary-bg py-32 flex flex-col items-center justify-center text-center select-none font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-muted-gold border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-secondary-text font-light animate-pulse">Verifying security credentials...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-primary-bg py-32 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <FadeIn className="flex flex-col items-center text-center mb-16">
          <span className="font-serif text-[10px] md:text-xs tracking-[0.25em] text-muted-gold font-medium uppercase mb-2">
            Demo Control Center
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-primary-text font-normal mb-4">
            Boutique Admin Panel
          </h1>
          <p className="text-xs text-secondary-text max-w-md font-light leading-relaxed">
            Easily manage your boutique catalog in real-time. Add new styles, edit product details, swap image photography, and watch your changes immediately take effect across the storefront!
          </p>
          <div className="ornament-line mt-6">
            <span className="ornament-diamond" />
          </div>
        </FadeIn>

        <FadeIn className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
              activeTab === "catalog"
                ? "bg-forest-green text-primary-bg border-forest-green"
                : "border-border-accent/40 text-secondary-text hover:border-muted-gold"
            }`}
          >
            Manage Catalog
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-forest-green text-primary-bg border-forest-green"
                : "border-border-accent/40 text-secondary-text hover:border-muted-gold"
            }`}
          >
            Orders Log
          </button>
          <button
            onClick={() => {
              setActiveTab("notifications");
              setCurrentLogsPage(1);
            }}
            className={`px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider rounded-full border transition-all cursor-pointer ${
              activeTab === "notifications"
                ? "bg-forest-green text-primary-bg border-forest-green"
                : "border-border-accent/40 text-secondary-text hover:border-muted-gold"
            }`}
          >
            Communications Log
          </button>
        </FadeIn>

        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Block: Add Product Form */}
          <FadeIn className="lg:col-span-1 bg-card border border-border-accent/40 p-8 rounded-md shadow-xs">
            <h2 className="font-serif text-xl text-primary-text mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-muted-gold" />
              Add New Product
            </h2>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-5 text-xs text-secondary-text">
              
              {/* Product Name */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Traditional Zari Saree"
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors"
                />
              </div>

              {/* Product Price */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Price (INR - ₹)</label>
                <input
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1999"
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors"
                />
              </div>

              {/* Initial Stock Level */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Initial Stock Level</label>
                <input
                  required
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 10"
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Category Selection</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Occasion/Collection Tag */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Occasion / Collection Tag</label>
                <select
                  value={collectionTag}
                  onChange={(e) => setCollectionTag(e.target.value)}
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors cursor-pointer"
                >
                  <option value="">None (General Catalog)</option>
                  <option value="wedding">Wedding Collection</option>
                  <option value="festival">Festival Collection</option>
                  <option value="office-wear">Office Wear</option>
                  <option value="daily-wear">Daily Wear</option>
                  <option value="party-wear">Party Wear</option>
                  <option value="traditional">Traditional</option>
                  <option value="designer">Designer</option>
                  <option value="casual">Casual</option>
                </select>
              </div>

              {/* Dropdown for Active Image Slot */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Target Image Slot</label>
                <select
                  value={activeImageSlot}
                  onChange={(e) => setActiveImageSlot(e.target.value as any)}
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors cursor-pointer"
                >
                  <option value="main">Main Product Photo</option>
                  <option value="side1">Side Profile 1 Photo</option>
                  <option value="side2">Side Profile 2 Photo</option>
                </select>
              </div>

              {/* Image Selection presets */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Select Photo Preset for Active Slot</label>
                <div className="grid grid-cols-5 gap-2 max-h-[120px] overflow-y-auto p-1 border border-border-accent/40 rounded-xs bg-primary-bg no-scrollbar">
                  {imagePresets.map((preset) => {
                    const isActiveValue = 
                      activeImageSlot === "main" 
                        ? imageUrl === preset.path 
                        : activeImageSlot === "side1" 
                        ? sideProfile1 === preset.path 
                        : sideProfile2 === preset.path;

                    return (
                      <div
                        key={preset.label}
                        onClick={() => {
                          if (activeImageSlot === "main") {
                            setImageUrl(preset.path);
                          } else if (activeImageSlot === "side1") {
                            setSideProfile1(preset.path);
                          } else if (activeImageSlot === "side2") {
                            setSideProfile2(preset.path);
                          }
                        }}
                        className={`aspect-square rounded-xs border overflow-hidden cursor-pointer hover:border-muted-gold relative ${
                          isActiveValue
                            ? "border-muted-gold ring-1 ring-muted-gold/20"
                            : "border-border-accent/40"
                        }`}
                        title={preset.label}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.path}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Or upload from storage */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Or Upload Image from Local Storage</label>
                <div className="relative border border-dashed border-border-accent/50 hover:border-muted-gold p-4 rounded-xs text-center cursor-pointer transition-colors bg-primary-bg flex flex-col items-center justify-center gap-2 group min-h-[80px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                  />
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold text-muted-gold group-hover:underline">
                      {isUploading ? "Uploading file..." : "Choose Local Image File"}
                    </span>
                    <span className="text-[10px] text-secondary-text/70">
                      Supports PNG, JPG, WEBP (Max 5MB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Or custom URL */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Or Custom Image URL for Active Slot</label>
                <input
                  type="text"
                  value={
                    activeImageSlot === "main" 
                      ? imageUrl 
                      : activeImageSlot === "side1" 
                      ? sideProfile1 
                      : sideProfile2
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (activeImageSlot === "main") {
                      setImageUrl(val);
                    } else if (activeImageSlot === "side1") {
                      setSideProfile1(val);
                    } else if (activeImageSlot === "side2") {
                      setSideProfile2(val);
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors"
                />
              </div>

              {/* Slots Status Display */}
              <div className="bg-[#FAF8F3]/50 border border-border-accent/35 p-3.5 rounded-sm flex flex-col gap-2 text-[10px]">
                <div className="font-bold uppercase tracking-wider text-muted-gold">Assigned Slots Preview:</div>
                <div className="flex items-center justify-between border-b border-border-accent/15 pb-1">
                  <span>Main Photo:</span>
                  <span className="font-semibold truncate max-w-[180px] text-primary-text">{imageUrl || "Not Set"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-accent/15 pb-1">
                  <span>Side Profile 1:</span>
                  <span className="font-semibold truncate max-w-[180px] text-primary-text">{sideProfile1 || "Not Set"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Side Profile 2:</span>
                  <span className="font-semibold truncate max-w-[180px] text-primary-text">{sideProfile2 || "Not Set"}</span>
                </div>
              </div>

              {/* Editorial Specifications Toggle */}
              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowEditorialSpecs(!showEditorialSpecs)}
                  className="w-full flex items-center justify-between border border-border-accent/40 bg-card p-3 rounded-xs text-xs font-semibold uppercase tracking-wider text-primary-text hover:border-muted-gold transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-muted-gold" />
                    <span>Editorial Specifications (Optional)</span>
                  </span>
                  <span>{showEditorialSpecs ? "▲" : "▼"}</span>
                </button>

                {showEditorialSpecs && (
                  <div className="flex flex-col gap-3 p-4 border border-border-accent/30 rounded-xs bg-[#FFFDF9]/40 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Fabric Type</label>
                        <input
                          type="text"
                          value={fabric}
                          onChange={(e) => setFabric(e.target.value)}
                          placeholder="e.g. Fine Banarasi Silk"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Dimensions</label>
                        <input
                          type="text"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          placeholder="e.g. 5.5m Saree + 0.8m Blouse"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Garment Cut</label>
                        <input
                          type="text"
                          value={garmentCut}
                          onChange={(e) => setGarmentCut(e.target.value)}
                          placeholder="e.g. Unstitched Saree"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Artisan Origin</label>
                        <input
                          type="text"
                          value={artisanOrigin}
                          onChange={(e) => setArtisanOrigin(e.target.value)}
                          placeholder="e.g. Varanasi, India"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Weaving Style</label>
                        <input
                          type="text"
                          value={weavingStyle}
                          onChange={(e) => setWeavingStyle(e.target.value)}
                          placeholder="e.g. Katan Silk Brocade"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Craft Time</label>
                        <input
                          type="text"
                          value={craftTime}
                          onChange={(e) => setCraftTime(e.target.value)}
                          placeholder="e.g. 72 Hours"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Thread Count</label>
                        <input
                          type="text"
                          value={threadCount}
                          onChange={(e) => setThreadCount(e.target.value)}
                          placeholder="e.g. 120s Double Warp"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold tracking-wider text-secondary-text">Garment Care</label>
                        <input
                          type="text"
                          value={washingStandard}
                          onChange={(e) => setWashingStandard(e.target.value)}
                          placeholder="e.g. Dry Clean Only"
                          className="bg-primary-bg border border-border-accent p-2 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter editorial description..."
                  rows={4}
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest-green hover:bg-[#1a2b24] text-primary-bg py-3.5 text-[10px] font-sans font-semibold tracking-widest uppercase rounded-xs border border-muted-gold/20 hover:border-muted-gold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                Add to Store Catalog
              </button>
            </form>
            {/* Future: Supabase insert trigger config */}
          </FadeIn>

          {/* Right Block: Manage Products List */}
          <FadeIn delay={0.15} className="lg:col-span-2 bg-card border border-border-accent/40 p-8 rounded-md shadow-xs">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-xl text-primary-text flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-muted-gold" />
                Manage Live Catalog
              </h2>
              
              <button
                onClick={handleResetCatalog}
                className="px-3 py-1.5 border border-border-accent/60 hover:border-muted-gold hover:text-muted-gold text-[9px] uppercase tracking-wider font-medium rounded-xs transition-colors cursor-pointer"
              >
                Reset Catalog Defaults
              </button>
            </div>

            {/* List */}
            <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
              {products.length > 0 ? (
                products.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-primary-bg/50 border border-border-accent/30 p-4 rounded-md hover:border-muted-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Product Photo */}
                      <div className="w-16 h-20 bg-card border border-border-accent/40 rounded-xs overflow-hidden relative flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Details info */}
                      <div className="flex flex-col">
                        <Link href={`/product/${prod.id}`} className="font-serif text-sm text-primary-text hover:text-muted-gold transition-colors font-medium">
                          {prod.name}
                        </Link>
                        <span className="text-[9px] uppercase tracking-wider text-secondary-text mt-0.5 font-sans font-medium flex items-center gap-1.5 flex-wrap">
                          <span>{prod.category}</span>
                          <span>•</span>
                          <span>₹{prod.price.toLocaleString("en-IN")}</span>
                          <span>•</span>
                          <span className={`font-bold ${prod.stock === 0 ? "text-red-700" : "text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-full"}`}>
                            Stock: {prod.stock !== undefined ? prod.stock : 10}
                          </span>
                        </span>
                        <p className="text-[10px] text-secondary-text/80 leading-relaxed font-light mt-1.5 max-w-sm line-clamp-1">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
                      
                      {/* Quick Edit Stock Level */}
                      <div className="flex items-center gap-1 bg-card border border-border-accent/40 px-2 py-1 rounded-xs">
                        <span className="text-[8px] uppercase font-sans font-semibold tracking-wider text-secondary-text">Stock:</span>
                        <input
                          type="number"
                          min="0"
                          defaultValue={prod.stock !== undefined ? prod.stock : 10}
                          onBlur={async (e) => {
                            const newStockVal = Number(e.target.value);
                            if (isNaN(newStockVal) || newStockVal < 0) {
                              toast.error("Please enter a valid stock count");
                              return;
                            }
                            if (newStockVal === prod.stock) return;
                            
                            const toastId = toast.loading(`Updating stock for ${prod.name}...`);
                            try {
                              await updateProductStock(prod.id, newStockVal);
                              const updated = await getProducts();
                              setProducts(updated);
                              toast.success("Stock level updated successfully!", { id: toastId });
                            } catch (err: any) {
                              toast.error(`Stock update failed: ${err.message}`, { id: toastId });
                            }
                          }}
                          className="w-10 text-[9px] font-sans font-bold text-primary-text bg-transparent border-none outline-none text-center"
                        />
                      </div>

                      {/* Quick Swap Photo Dropdown Trigger */}
                      <div className="flex items-center gap-1.5 bg-card border border-border-accent/40 px-2 py-1.5 rounded-xs">
                        <ImageIcon className="w-3.5 h-3.5 text-muted-gold" />
                        <select
                          onChange={(e) => handleUpdateProductPhoto(prod.id, e.target.value)}
                          value={prod.imageUrl}
                          className="text-[9px] uppercase font-sans font-semibold tracking-wider text-secondary-text bg-transparent border-none outline-none cursor-pointer"
                        >
                          <option disabled value="">Change Photo</option>
                          {imagePresets.map((preset) => (
                            <option key={preset.path} value={preset.path}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Occasion Selector */}
                      <div className="flex items-center gap-1.5 bg-card border border-border-accent/40 px-2 py-1.5 rounded-xs">
                        <Tag className="w-3.5 h-3.5 text-muted-gold" />
                        <select
                          onChange={async (e) => {
                            const newTag = e.target.value;
                            const toastId = toast.loading(`Updating occasion tag for ${prod.name}...`);
                            try {
                              await updateProductCollectionTag(prod.id, newTag);
                              const updated = await getProducts();
                              setProducts(updated);
                              toast.success("Occasion updated successfully!", { id: toastId });
                            } catch (err: any) {
                              toast.error(`Occasion update failed: ${err.message}`, { id: toastId });
                            }
                          }}
                          value={prod.collectionTag || ""}
                          className="text-[9px] uppercase font-sans font-semibold tracking-wider text-secondary-text bg-transparent border-none outline-none cursor-pointer"
                        >
                          <option value="">No Occasion</option>
                          <option value="wedding">Wedding</option>
                          <option value="festival">Festival</option>
                          <option value="office-wear">Office Wear</option>
                          <option value="daily-wear">Daily Wear</option>
                          <option value="party-wear">Party Wear</option>
                          <option value="traditional">Traditional</option>
                          <option value="designer">Designer</option>
                          <option value="casual">Casual</option>
                        </select>
                      </div>

                      {/* Edit Specifications */}
                      <button
                        onClick={() => {
                          setEditingSpecsProduct(prod);
                          setEditSpecsData({
                            fabric: prod.fabric || "",
                            dimensions: prod.dimensions || "",
                            garmentCut: prod.garmentCut || "",
                            artisanOrigin: prod.artisanOrigin || "",
                            weavingStyle: prod.weavingStyle || "",
                            craftTime: prod.craftTime || "",
                            threadCount: prod.threadCount || "",
                            washingStandard: prod.washingStandard || "",
                          });
                        }}
                        className="p-2 border border-border-accent/40 hover:border-muted-gold hover:text-muted-gold rounded-xs transition-colors cursor-pointer text-secondary-text"
                        title="Edit specifications"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-2 border border-border-accent/40 hover:border-red-700 hover:text-red-700 rounded-xs transition-colors cursor-pointer text-secondary-text"
                        title="Remove product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <ShoppingBag className="w-10 h-10 text-border-accent/60 mx-auto mb-4 stroke-[1.25]" />
                  <p className="font-serif text-base text-secondary-text italic">No products in store catalog</p>
                </div>
              )}
            </div>

            {/* Future: Cloudinary file uploads & Supabase DB deletes */}
          </FadeIn>

          </div>
        )}

        {/* Orders Log Tab Content */}
        {activeTab === "orders" && (
          <FadeIn className="bg-card border border-border-accent/40 p-8 rounded-[2rem] shadow-xs w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-xl text-primary-text flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-muted-gold" />
                Boutique Orders Log ({orders.length})
              </h2>
              <button
                onClick={fetchOrders}
                className="px-3 py-1.5 border border-border-accent/60 hover:border-muted-gold hover:text-muted-gold text-[9px] uppercase tracking-wider font-medium rounded-xs transition-colors cursor-pointer"
              >
                Refresh Orders
              </button>
            </div>

            {isLoadingOrders ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-muted-gold border-t-transparent animate-spin" />
                <span className="text-xs text-secondary-text font-light">Loading boutique transactions...</span>
              </div>
            ) : orders.length > 0 ? (
              <div className="flex flex-col gap-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-border-accent/45 rounded-2xl bg-primary-bg/15 hover:border-muted-gold/45 transition-colors p-6 flex flex-col gap-4 text-xs"
                  >
                    {/* Order Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-accent/25 pb-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-[10px] text-secondary-text font-semibold uppercase">
                          Order ID: <span className="text-primary-text">#RL-{order.id.slice(0, 8).toUpperCase()}</span>
                        </span>
                        <span className="text-[10px] text-secondary-text font-light">
                          Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] uppercase tracking-wider text-secondary-text">Amount Paid</span>
                          <span className="font-sans text-sm font-bold text-chocolate">₹{order.total_amount.toLocaleString("en-IN")}</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] uppercase tracking-wider font-bold">
                          Paid via Razorpay
                        </span>
                      </div>
                    </div>

                    {/* Customer Details Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2 border-b border-border-accent/25 pb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Customer</span>
                        <span className="font-serif text-sm font-medium text-primary-text">{order.customer_name}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Contact Number</span>
                        <span className="font-sans text-primary-text">{order.customer_phone}</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Shipping Address</span>
                        <p className="text-primary-text leading-relaxed font-light">
                          {order.shipping_address}, {order.city} - {order.pincode}
                        </p>
                      </div>
                    </div>

                    {/* Line Items Row */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Items Ordered</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {order.order_items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 bg-card border border-border-accent/20 p-3 rounded-xl"
                          >
                            <div className="w-10 h-12 bg-primary-bg rounded-xs overflow-hidden relative flex-shrink-0">
                              <img
                                src={item.products?.image_url || "/images/hero-fallback.jpg"}
                                alt={item.products?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-serif text-xs text-primary-text font-medium truncate">
                                {item.products?.name || "Deleted Product"}
                              </span>
                              <span className="text-[10px] text-secondary-text mt-0.5 font-light">
                                Qty: {item.quantity} • ₹{item.price.toLocaleString("en-IN")} each
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Integration Controls */}
                    <div className="flex justify-between items-center border-t border-border-accent/25 pt-4 mt-2 w-full">
                      {order.shipping_status === "shipped" ? (
                        <div className="flex flex-wrap items-center gap-4 justify-between w-full">
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Courier Partner</span>
                            <span className="font-sans text-primary-text font-medium">{order.shiprocket_courier_name}</span>
                          </div>
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">AWB Tracking Code</span>
                            <span className="font-mono text-primary-text font-semibold">{order.shiprocket_awb_code}</span>
                          </div>
                          <a
                            href={order.shiprocket_tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary-bg border border-border-accent/40 hover:border-muted-gold text-secondary-text hover:text-primary-text px-4 py-2 text-[9px] font-sans font-semibold tracking-wider uppercase rounded-full transition-colors cursor-pointer"
                          >
                            Track Shipment
                          </a>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary-text">Shipping Status</span>
                            <span className="font-sans text-amber-700 font-medium capitalize">{order.shipping_status || "Processing"}</span>
                          </div>
                          <button
                            onClick={() => handleShipOrder(order.id)}
                            className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-5 py-2.5 text-[9px] font-sans font-semibold tracking-wider uppercase rounded-full border border-muted-gold/20 hover:border-muted-gold transition-all cursor-pointer flex items-center gap-2"
                          >
                            <FolderHeart className="w-3.5 h-3.5 text-muted-gold" />
                            Process with Shiprocket
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-secondary-text/75 font-serif italic text-sm border border-dashed border-border-accent/40 rounded-2xl">
                No orders have been placed yet. Make a checkout using the storefront to see it listed here!
              </div>
            )}
          </FadeIn>
        )}

        {/* Communications Log Tab Content */}
        {activeTab === "notifications" && (
          <FadeIn className="bg-card border border-border-accent/40 p-8 rounded-[2rem] shadow-xs w-full">
            {/* Tab Header */}
            <div className="flex justify-between items-center mb-8 border-b border-border-accent/25 pb-4">
              <h2 className="font-serif text-xl text-primary-text flex items-center gap-2">
                <Mail className="w-5 h-5 text-muted-gold" />
                Boutique Communications Log ({totalLogsCount})
              </h2>
              <button
                onClick={fetchLogs}
                className="px-3 py-1.5 border border-border-accent/60 hover:border-muted-gold hover:text-muted-gold text-[9px] uppercase tracking-wider font-medium rounded-xs transition-colors cursor-pointer"
              >
                Refresh Logs
              </button>
            </div>

            {/* Counters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#FAF8F3]/50 border border-border-accent/30 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase tracking-wider text-secondary-text font-semibold">Emails Sent</span>
                <p className="font-sans text-xl font-bold text-forest-green mt-1">{logCounters.sentEmails}</p>
              </div>
              <div className="bg-[#FAF8F3]/50 border border-border-accent/30 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase tracking-wider text-secondary-text font-semibold">Emails Failed</span>
                <p className="font-sans text-xl font-bold text-red-700 mt-1">{logCounters.failedEmails}</p>
              </div>
              <div className="bg-[#FAF8F3]/50 border border-border-accent/30 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase tracking-wider text-secondary-text font-semibold">SMS Sent</span>
                <p className="font-sans text-xl font-bold text-forest-green mt-1">{logCounters.sentSms}</p>
              </div>
              <div className="bg-[#FAF8F3]/50 border border-border-accent/30 p-4 rounded-xl text-center">
                <span className="text-[9px] uppercase tracking-wider text-secondary-text font-semibold">SMS Failed</span>
                <p className="font-sans text-xl font-bold text-red-700 mt-1">{logCounters.failedSms}</p>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 text-xs items-center justify-between">
              {/* Search bar */}
              <div className="w-full md:w-1/3 relative">
                <input
                  type="text"
                  placeholder="Search recipient or order ID..."
                  value={logsSearchInput}
                  onChange={(e) => setLogsSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchTerm(logsSearchInput);
                      setCurrentLogsPage(1);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-primary-bg/50 border border-border-accent/40 rounded-full text-xs text-primary-text focus:outline-none focus:border-muted-gold"
                />
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text" />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as any);
                    setCurrentLogsPage(1);
                  }}
                  className="bg-primary-bg/50 border border-border-accent/45 px-3 py-2.5 rounded-full text-xs text-primary-text outline-none cursor-pointer focus:border-muted-gold"
                >
                  <option value="all">All Channels</option>
                  <option value="email">Emails Only</option>
                  <option value="sms">SMS Only</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value as any);
                    setCurrentLogsPage(1);
                  }}
                  className="bg-primary-bg/50 border border-border-accent/45 px-3 py-2.5 rounded-full text-xs text-primary-text outline-none cursor-pointer focus:border-muted-gold"
                >
                  <option value="all">All Statuses</option>
                  <option value="sent">Sent Success</option>
                  <option value="failed">Failed Delivery</option>
                  <option value="pending">Pending Queue</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm(logsSearchInput);
                    setCurrentLogsPage(1);
                  }}
                  className="bg-forest-green hover:bg-[#1a2b24] text-primary-bg px-5 py-2.5 text-[9px] uppercase tracking-wider font-bold rounded-full cursor-pointer border border-muted-gold/25 hover:border-muted-gold transition-colors"
                >
                  Apply Search
                </button>
              </div>
            </div>

            {/* Logs Table */}
            {isLoadingLogs ? (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-muted-gold border-t-transparent animate-spin" />
                <span className="text-xs text-secondary-text font-light">Loading communication history...</span>
              </div>
            ) : logs.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="w-full overflow-x-auto border border-border-accent/30 rounded-xl">
                  <table className="w-full border-collapse text-left text-xs text-secondary-text">
                    <thead>
                      <tr className="bg-[#FAF8F3] border-b border-border-accent/30 text-[9px] uppercase tracking-wider font-bold text-primary-text">
                        <th className="p-4">Channel</th>
                        <th className="p-4">Recipient</th>
                        <th className="p-4">Subject/Content</th>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Sent At</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        const isFailed = log.status === "failed";
                        const isEmail = log.notificationType === "email";
                        const formattedDate = new Date(log.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr key={`${log.notificationType}-${log.id}`} className="border-b border-border-accent/20 last:border-none hover:bg-[#FAF8F3]/30 transition-colors">
                            {/* Type */}
                            <td className="p-4">
                              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[8px] text-primary-text">
                                {isEmail ? (
                                  <>
                                    <Mail className="w-3.5 h-3.5 text-muted-gold" />
                                    Email
                                  </>
                                ) : (
                                  <>
                                    <Phone className="w-3.5 h-3.5 text-forest-green" />
                                    SMS
                                  </>
                                )}
                              </span>
                            </td>

                            {/* Recipient */}
                            <td className="p-4 font-mono font-medium text-primary-text select-text truncate max-w-[130px]">
                              {isEmail ? log.recipient_email : log.recipient_phone}
                            </td>

                            {/* Content Preview */}
                            <td className="p-4 font-light max-w-[200px] truncate select-text" title={isEmail ? log.subject : log.body}>
                              {isEmail ? (
                                <div>
                                  <span className="font-semibold text-primary-text block">{log.subject}</span>
                                  <span className="text-[9px] text-secondary-text uppercase tracking-wider">{log.type}</span>
                                </div>
                              ) : (
                                log.body
                              )}
                              {isFailed && log.error_message && (
                                <p className="text-[9px] text-red-700 italic font-medium mt-1 leading-normal">
                                  Error: {log.error_message}
                                </p>
                              )}
                            </td>

                            {/* Order ID */}
                            <td className="p-4 font-mono">
                              {log.order_id ? `#RL-${log.order_id.slice(0, 8).toUpperCase()}` : "N/A"}
                            </td>

                            {/* Sent At */}
                            <td className="p-4 font-light text-[10px] text-secondary-text/80">{formattedDate}</td>

                            {/* Status */}
                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[8px] uppercase tracking-wider font-bold border ${
                                  log.status === "sent"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : log.status === "failed"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-4 text-right">
                              {isFailed ? (
                                <button
                                  onClick={() => handleRetryNotification(log.id, log.notificationType)}
                                  className="px-2.5 py-1 border border-red-200 hover:border-red-700 text-red-700 hover:bg-red-50/50 text-[9px] uppercase tracking-wider font-semibold rounded-xs transition-all cursor-pointer flex items-center gap-1 ml-auto font-sans"
                                >
                                  <RefreshCw className="w-2.5 h-2.5 animate-spin-hover" />
                                  Retry
                                </button>
                              ) : (
                                <span className="text-[9px] italic text-secondary-text/40">Delivered</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center border-t border-border-accent/20 pt-4 mt-2">
                  <span className="text-[10px] text-secondary-text font-light">
                    Showing {logs.length} of {totalLogsCount} logs
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentLogsPage(p => Math.max(p - 1, 1))}
                      disabled={currentLogsPage === 1}
                      className="px-3 py-1.5 border border-border-accent/40 rounded-xs text-[10px] uppercase font-bold disabled:opacity-40 transition-opacity cursor-pointer hover:border-primary-text"
                    >
                      Prev
                    </button>
                    <span className="font-mono text-xs font-bold text-primary-text px-2">{currentLogsPage}</span>
                    <button
                      onClick={() => setCurrentLogsPage(p => (p * 10 < totalLogsCount ? p + 1 : p))}
                      disabled={currentLogsPage * 10 >= totalLogsCount}
                      className="px-3 py-1.5 border border-border-accent/40 rounded-xs text-[10px] uppercase font-bold disabled:opacity-40 transition-opacity cursor-pointer hover:border-primary-text"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-secondary-text/75 font-serif italic text-sm border border-dashed border-border-accent/40 rounded-2xl">
                No notification logs found matching the filters.
              </div>
            )}
          </FadeIn>
        )}

      </div>

      {/* Edit Specifications Modal overlay */}
      {editingSpecsProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] border border-border-accent/40 w-full max-w-2xl rounded-2xl shadow-luxury overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn text-xs text-secondary-text font-sans">
            {/* Header */}
            <div className="p-6 border-b border-border-accent/25 bg-card flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-muted-gold" />
                <div>
                  <h3 className="font-serif text-base text-primary-text font-semibold text-slate-800">Edit Specifications</h3>
                  <p className="text-[10px] text-secondary-text/80 uppercase tracking-wider font-light mt-0.5">{editingSpecsProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSpecsProduct(null)}
                className="p-1.5 text-primary-text hover:text-muted-gold transition-colors rounded-full hover:bg-secondary-bg/20 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inputs Form */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Fabric Type</label>
                  <input
                    type="text"
                    value={editSpecsData.fabric}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, fabric: e.target.value })}
                    placeholder="e.g. Premium Handloom Kora"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Dimensions</label>
                  <input
                    type="text"
                    value={editSpecsData.dimensions}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, dimensions: e.target.value })}
                    placeholder="e.g. 5.5m Standard Saree"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Garment Cut</label>
                  <input
                    type="text"
                    value={editSpecsData.garmentCut}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, garmentCut: e.target.value })}
                    placeholder="e.g. Unstitched Heritage Saree"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Artisan Origin</label>
                  <input
                    type="text"
                    value={editSpecsData.artisanOrigin}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, artisanOrigin: e.target.value })}
                    placeholder="e.g. Varanasi, India"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Weaving Style</label>
                  <input
                    type="text"
                    value={editSpecsData.weavingStyle}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, weavingStyle: e.target.value })}
                    placeholder="e.g. Handloom Zari Weave"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Estimated Craft Time</label>
                  <input
                    type="text"
                    value={editSpecsData.craftTime}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, craftTime: e.target.value })}
                    placeholder="e.g. 72 Hours"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Thread Count</label>
                  <input
                    type="text"
                    value={editSpecsData.threadCount}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, threadCount: e.target.value })}
                    placeholder="e.g. 120s Double Warp"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="uppercase tracking-wider font-bold text-secondary-text text-[10px]">Garment Care</label>
                  <input
                    type="text"
                    value={editSpecsData.washingStandard}
                    onChange={(e) => setEditSpecsData({ ...editSpecsData, washingStandard: e.target.value })}
                    placeholder="e.g. Dry Clean Only"
                    className="bg-primary-bg border border-border-accent/40 p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold text-xs transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 bg-card border-t border-border-accent/25 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingSpecsProduct(null)}
                className="px-5 py-3 border border-border-accent/45 hover:border-primary-text text-[10px] uppercase font-bold tracking-wider rounded-xs cursor-pointer transition-colors bg-transparent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const toastId = toast.loading("Saving updated specifications...");
                  try {
                    await updateProductSpecs(editingSpecsProduct.id, editSpecsData);
                    const updated = await getProducts();
                    setProducts(updated);
                    setEditingSpecsProduct(null);
                    toast.success("Specifications updated successfully!", { id: toastId });
                  } catch (err: any) {
                    toast.error(`Update failed: ${err.message}`, { id: toastId });
                  }
                }}
                className="px-6 py-3 bg-forest-green hover:bg-[#1a2b24] text-primary-bg text-[10px] uppercase font-bold tracking-wider rounded-xs border border-muted-gold/25 hover:border-muted-gold cursor-pointer transition-all shadow-xs"
              >
                Save Specifications
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

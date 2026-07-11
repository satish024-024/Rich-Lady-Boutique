"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, RefreshCw, ShoppingBag, Tag, DollarSign, ChevronDown, ChevronUp, Sliders, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";
import { Product } from "@/types/product";
import { getProducts, addProduct, deleteProduct, updateProductStock, updateProductSpecs } from "@/utils/db";

const PRESET_IMAGES = [
  "/images/cat_sarees.jpg",
  "/images/cat_kurtis.jpg",
  "/images/cat_lehengas.jpg",
  "/images/cat_gowns.jpg",
  "/images/cat_kids.jpg",
  "/images/prod_kids_sherwani.jpg",
  "/images/cat_dress_materials.jpg",
  "/images/cat_western.jpg",
  "/images/prod_velvet_lehenga.jpg",
  "/images/prod_silk_saree.jpg"
];

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sarees");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/cat_sarees.jpg");
  const [sideProfile1Url, setSideProfile1Url] = useState("");
  const [sideProfile2Url, setSideProfile2Url] = useState("");
  const [stock, setStock] = useState("10");
  const [collectionTag, setCollectionTag] = useState("");
  const [activeImageSlot, setActiveImageSlot] = useState<"main" | "side1" | "side2">("main");
  const [isUploading, setIsUploading] = useState(false);
  const [showEditorialSpecs, setShowEditorialSpecs] = useState(false);

  const [fabric, setFabric] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [garmentCut, setGarmentCut] = useState("");
  const [artisanOrigin, setArtisanOrigin] = useState("");
  const [weavingStyle, setWeavingStyle] = useState("");
  const [craftTime, setCraftTime] = useState("");
  const [threadCount, setThreadCount] = useState("");
  const [washingStandard, setWashingStandard] = useState("");

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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const all = await getProducts();
      setProducts(all);
    } catch (err) {
      toast.error("Failed to load catalog products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success && data.data) {
        setCategories(data.data);
        if (data.data.length > 0) {
          const defaultCat = data.data.find((c: any) => c.name.toLowerCase() === "sarees") || data.data[0];
          setCategoryId(defaultCat.id);
          setCategory(defaultCat.name);
        }
      }
    } catch (err) {
      console.error("Failed to load categories for select", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("Name and Price are required");
      return;
    }

    try {
      const newProd: any = {
        id: Math.random().toString(36).substring(7),
        name,
        price: Number(price),
        category,
        categoryId: (categoryId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)) ? categoryId : undefined,
        description,
        imageUrl,
        sideProfile1Url: sideProfile1Url.trim() !== "" ? sideProfile1Url.trim() : undefined,
        sideProfile2Url: sideProfile2Url.trim() !== "" ? sideProfile2Url.trim() : undefined,
        stock: Number(stock),
        fabric,
        dimensions,
        garmentCut,
        artisanOrigin,
        weavingStyle,
        craftTime,
        threadCount,
        washingStandard,
        collectionTag: collectionTag.trim() !== "" ? collectionTag.trim() : undefined,
        isNewArrival: true,
        rating: 5.0,
        reviewsCount: 0
      };

      await addProduct(newProd);
      toast.success("Style added to boutique catalog!");
      
      // Reset inputs
      setName("");
      setPrice("");
      setDescription("");
      setImageUrl("/images/cat_sarees.jpg");
      setSideProfile1Url("");
      setSideProfile2Url("");
      setStock("10");
      setCollectionTag("");
      setFabric("");
      setDimensions("");
      setGarmentCut("");
      setArtisanOrigin("");
      setWeavingStyle("");
      setCraftTime("");
      setThreadCount("");
      setWashingStandard("");
      setActiveImageSlot("main");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    }
  };

  const handleArchiveProduct = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Style archived successfully");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive product");
    }
  };

  const handleOpenSpecsEditor = (prod: Product) => {
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
  };

  const handleSaveSpecs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSpecsProduct) return;

    try {
      await updateProductSpecs(editingSpecsProduct.id, editSpecsData);
      toast.success("Editorial specs updated");
      setEditingSpecsProduct(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to update specs");
    }
  };

  const handleSelectPreset = (url: string) => {
    if (activeImageSlot === "main") {
      setImageUrl(url);
    } else if (activeImageSlot === "side1") {
      setSideProfile1Url(url);
    } else if (activeImageSlot === "side2") {
      setSideProfile2Url(url);
    }
  };

  const getActiveSlotUrl = () => {
    if (activeImageSlot === "main") return imageUrl;
    if (activeImageSlot === "side1") return sideProfile1Url;
    return sideProfile2Url;
  };

  const handleActiveSlotUrlChange = (val: string) => {
    if (activeImageSlot === "main") {
      setImageUrl(val);
    } else if (activeImageSlot === "side1") {
      setSideProfile1Url(val);
    } else if (activeImageSlot === "side2") {
      setSideProfile2Url(val);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPEG, PNG, WEBP, etc.)");
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
        setSideProfile1Url(result.url);
      } else if (activeImageSlot === "side2") {
        setSideProfile2Url(result.url);
      }

      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(`Upload error: ${err.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Products List Table */}
      <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <div className="flex justify-between items-center mb-5 border-b border-border-accent/20 pb-3">
          <h3 className="font-serif text-lg text-primary-text flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-muted-gold" />
            Boutique Catalog ({products.length} items)
          </h3>
          <button onClick={fetchProducts} disabled={loading} className="p-1.5 border border-border-accent/30 rounded-full cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto max-h-[1200px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-accent/25 text-secondary-text uppercase tracking-wider font-bold">
                <th>Cover</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} className="border-b border-border-accent/15 text-primary-text hover:bg-[#FAF8F3]/50 transition-colors">
                  <td className="py-3">
                    <img src={prod.imageUrl} alt={prod.name} className="w-9 h-12 object-cover rounded border border-border-accent/20" />
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{prod.name}</span>
                      <span className="text-[10px] text-muted-gold font-sans">{prod.category}</span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold">₹{prod.price}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] ${(prod.stock ?? 0) > 0 ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-700"}`}>
                      {prod.stock ?? 0} left
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenSpecsEditor(prod)} className="p-1 text-muted-gold hover:bg-muted-gold/10 rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleArchiveProduct(prod.id)} className="p-1 text-red-600 hover:bg-red-500/10 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Add Style Form */}
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs text-left">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3 flex items-center gap-1.5">
          <span className="text-muted-gold font-light text-xl">+</span> Add New Product
        </h3>
        
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Product Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Traditional Zari Saree"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Price (INR - ₹)</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              placeholder="e.g. 1999"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Initial Stock Level</label>
            <input 
              type="number" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              placeholder="10"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors" 
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Category Selection</label>
            <div className="relative">
              <select 
                value={categoryId} 
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setCategoryId(selectedId);
                  const catObj = categories.find(c => c.id === selectedId);
                  if (catObj) setCategory(catObj.name);
                }}
                className="w-full p-2.5 pr-10 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Sarees">Sarees</option>
                    <option value="Kurtis">Kurtis</option>
                    <option value="Lehengas">Lehengas</option>
                    <option value="Gowns">Gowns</option>
                    <option value="Western Wear">Western Wear</option>
                    <option value="Kids Wear">Kids Wear</option>
                  </>
                )}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary-text">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Occasion / Collection Tag</label>
            <div className="relative">
              <select 
                value={collectionTag} 
                onChange={(e) => setCollectionTag(e.target.value)} 
                className="w-full p-2.5 pr-10 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              >
                <option value="">None (General Catalog)</option>
                <option value="wedding">Wedding Collection</option>
                <option value="festive">Festive Collection</option>
                <option value="everyday">Everyday Wear</option>
                <option value="sale">Sale / Discounted</option>
                <option value="new-arrivals">New Arrivals</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary-text">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Target Image Slot</label>
            <div className="relative">
              <select 
                value={activeImageSlot} 
                onChange={(e) => setActiveImageSlot(e.target.value as any)} 
                className="w-full p-2.5 pr-10 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors appearance-none cursor-pointer"
              >
                <option value="main">Main Product Photo</option>
                <option value="side1">Side Profile 1</option>
                <option value="side2">Side Profile 2</option>
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-secondary-text">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Select Photo Preset for Active Slot</label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_IMAGES.map((url) => {
                const isSelected = 
                  (activeImageSlot === "main" && imageUrl === url) ||
                  (activeImageSlot === "side1" && sideProfile1Url === url) ||
                  (activeImageSlot === "side2" && sideProfile2Url === url);
                return (
                  <button
                    key={url}
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className={`aspect-square relative overflow-hidden rounded-xs border-2 transition-all ${
                      isSelected 
                        ? "border-[#8A2535] scale-95 shadow-md" 
                        : "border-border-accent/30 hover:border-muted-gold"
                    }`}
                  >
                    <img src={url} alt="Preset option" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Or Upload Image from Local Storage</label>
            <label className="flex flex-col items-center justify-center border border-dashed border-border-accent/60 rounded-xl p-4 bg-[#FAF8F3]/50 hover:bg-[#FAF8F3] hover:border-muted-gold transition-all cursor-pointer text-center relative overflow-hidden min-h-[90px]">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                disabled={isUploading}
                onChange={handleImageUpload} 
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-1.5 text-secondary-text">
                  <Loader2 className="w-5 h-5 text-muted-gold animate-spin" />
                  <span className="text-[10px] font-sans font-semibold tracking-wide">Uploading file...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-secondary-text">
                  <span className="text-[11px] font-serif font-semibold text-muted-gold">Choose Local Image File</span>
                  <span className="text-[9px] font-sans font-light tracking-tight text-secondary-text/80">Supports PNG, JPG, WEBP (Max 5MB)</span>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Or Custom Image URL for Active Slot</label>
            <input 
              type="text" 
              value={getActiveSlotUrl()} 
              onChange={(e) => handleActiveSlotUrlChange(e.target.value)} 
              placeholder="/images/cat_sarees.jpg"
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors" 
            />
          </div>

          <div className="bg-[#FAF8F3] border border-border-accent/30 rounded-xl p-3.5 flex flex-col gap-1.5 font-sans">
            <div className="text-[10px] uppercase tracking-wider font-bold text-secondary-text mb-1">
              Assigned Slots Preview:
            </div>
            <div className="flex justify-between items-center text-[10px] text-primary-text border-b border-border-accent/15 pb-1">
              <span className="font-semibold">Main Photo:</span>
              <span className="text-secondary-text max-w-[200px] truncate">{imageUrl || <span className="italic text-red-600">Not Set</span>}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-primary-text border-b border-border-accent/15 pb-1">
              <span className="font-semibold">Side Profile 1:</span>
              <span className="text-secondary-text max-w-[200px] truncate">{sideProfile1Url || <span className="italic text-secondary-text/60">Not Set</span>}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-primary-text">
              <span className="font-semibold">Side Profile 2:</span>
              <span className="text-secondary-text max-w-[200px] truncate">{sideProfile2Url || <span className="italic text-secondary-text/60">Not Set</span>}</span>
            </div>
          </div>

          <div className="border border-border-accent/35 rounded-xl overflow-hidden bg-primary-bg/50">
            <button
              type="button"
              onClick={() => setShowEditorialSpecs(!showEditorialSpecs)}
              className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-[#FAF8F3] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2 text-secondary-text">
                <Sliders className="w-3.5 h-3.5 text-muted-gold" />
                <span className="text-[10px] uppercase tracking-wider font-bold">Editorial Specifications (Optional)</span>
              </div>
              {showEditorialSpecs ? <ChevronUp className="w-4 h-4 text-secondary-text" /> : <ChevronDown className="w-4 h-4 text-secondary-text" />}
            </button>
            
            {showEditorialSpecs && (
              <div className="p-3.5 border-t border-border-accent/25 flex flex-col gap-3 bg-card">
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Fabric</label>
                    <input 
                      type="text" 
                      value={fabric} 
                      onChange={(e) => setFabric(e.target.value)} 
                      placeholder="e.g. Pure Georgette"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Weaving Style</label>
                    <input 
                      type="text" 
                      value={weavingStyle} 
                      onChange={(e) => setWeavingStyle(e.target.value)} 
                      placeholder="e.g. Banarasi Weave"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Dimensions</label>
                    <input 
                      type="text" 
                      value={dimensions} 
                      onChange={(e) => setDimensions(e.target.value)} 
                      placeholder="e.g. 5.5 meters"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Garment Cut</label>
                    <input 
                      type="text" 
                      value={garmentCut} 
                      onChange={(e) => setGarmentCut(e.target.value)} 
                      placeholder="e.g. Regular Fit"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Artisan Origin</label>
                    <input 
                      type="text" 
                      value={artisanOrigin} 
                      onChange={(e) => setArtisanOrigin(e.target.value)} 
                      placeholder="e.g. Andhra Pradesh"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Craft Time</label>
                    <input 
                      type="text" 
                      value={craftTime} 
                      onChange={(e) => setCraftTime(e.target.value)} 
                      placeholder="e.g. 12 Days"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Thread Count</label>
                    <input 
                      type="text" 
                      value={threadCount} 
                      onChange={(e) => setThreadCount(e.target.value)} 
                      placeholder="e.g. 80 Count"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-secondary-text font-bold mb-1">Washing Standard</label>
                    <input 
                      type="text" 
                      value={washingStandard} 
                      onChange={(e) => setWashingStandard(e.target.value)} 
                      placeholder="e.g. Dry Clean Only"
                      className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1.5">Product Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter editorial description..."
              rows={4}
              className="w-full p-2.5 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold transition-colors resize-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-[#1d3527] hover:bg-[#15261c] text-white text-xs uppercase font-bold tracking-widest rounded-xl transition-colors shadow-sm"
          >
            Add to Store Catalog
          </button>
        </form>
      </div>

      {/* Specifications Editor Modal */}
      {editingSpecsProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border-accent/45 w-full max-w-lg p-6 rounded-2xl shadow-luxury max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3">
              Edit Specs: {editingSpecsProduct.name}
            </h3>
            
            <form onSubmit={handleSaveSpecs} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase text-secondary-text font-bold mb-1">Fabric</label>
                  <input type="text" value={editSpecsData.fabric} onChange={(e) => setEditSpecsData({...editSpecsData, fabric: e.target.value})} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl" />
                </div>
                <div>
                  <label className="block text-[9px] uppercase text-secondary-text font-bold mb-1">Weaving Style</label>
                  <input type="text" value={editSpecsData.weavingStyle} onChange={(e) => setEditSpecsData({...editSpecsData, weavingStyle: e.target.value})} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setEditingSpecsProduct(null)} className="px-4 py-2 border border-border-accent/40 rounded-xl text-xs">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-forest-green text-primary-bg text-xs font-bold rounded-xl">
                  Save Specifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FadeIn>
  );
}

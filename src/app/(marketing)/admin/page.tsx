"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalProducts, saveLocalProducts } from "@/utils/db";
import { Product } from "@/types/product";
import { FadeIn } from "@/components/motion/FadeIn";
import { Plus, Trash2, Edit3, Image as ImageIcon, Sparkles, ShoppingBag, FolderHeart } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sarees");
  const [description, setDescription] = useState("");
  const [selectedImagePreset, setSelectedImagePreset] = useState("/images/cat_sarees.jpg");
  const [customImageUrl, setCustomImageUrl] = useState("");

  const categories = ["Sarees", "Kurtis", "Dress Materials", "Lehengas", "Gowns", "Accessories"];

  // Preloaded boutique stock images for easy selection in the demo
  const imagePresets = [
    { label: "Saree Silk", path: "/images/cat_sarees.jpg" },
    { label: "Saree Details", path: "/images/prod_silk_saree.jpg" },
    { label: "Kurti Embroidered", path: "/images/cat_kurtis.jpg" },
    { label: "Kurti Yellow", path: "/images/prod_anarkali_kurti.jpg" },
    { label: "Dress Materials Stack", path: "/images/cat_dress_materials.jpg" },
    { label: "Dress Materials Floral", path: "/images/prod_suit_set.jpg" },
    { label: "Lehenga Heavy", path: "/images/cat_lehengas.jpg" },
    { label: "Gown Fusion Green", path: "/images/cat_gowns.jpg" },
    { label: "Accessories Kundan Jewelry", path: "/images/cat_accessories.jpg" },
    { label: "New Arrivals Hangers", path: "/images/cat_new_arrivals.jpg" }
  ];

  useEffect(() => {
    setProducts(getLocalProducts());
  }, []);

  const handleAddProduct = (e: React.FormEvent) => {
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
      imageUrl: customImageUrl.trim() !== "" ? customImageUrl.trim() : selectedImagePreset,
      category,
      rating: 5.0,
      reviewsCount: 1,
      isNewArrival: true,
      description: description.trim() !== "" ? description.trim() : `Premium quality boutique design. Woven using traditional handloom methods, offering total style and comfort.`
    };

    // Save to local storage database
    const updated = [newProduct, ...products];
    saveLocalProducts(updated);
    setProducts(updated);

    // Reset Form
    setName("");
    setPrice("");
    setDescription("");
    setCustomImageUrl("");
    toast.success(`"${name}" successfully added to the catalog!`);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveLocalProducts(updated);
    setProducts(updated);
    toast.success(`Removed "${name}" from the store`);
  };

  const handleUpdateProductPhoto = (id: string, newPhotoPath: string) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        return { ...p, imageUrl: newPhotoPath };
      }
      return p;
    });
    saveLocalProducts(updated);
    setProducts(updated);
    toast.success("Product photo updated successfully!");
  };

  const handleResetCatalog = () => {
    localStorage.removeItem("rich-lady-products");
    const original = getLocalProducts();
    setProducts(original);
    toast.success("Catalog reset to default mock boutique products");
  };

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

        {/* Dashboard Grid */}
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
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1999"
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

              {/* Image Selection presets */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Select Photo Preset</label>
                <div className="grid grid-cols-5 gap-2 max-h-[120px] overflow-y-auto p-1 border border-border-accent/40 rounded-xs bg-primary-bg no-scrollbar">
                  {imagePresets.map((preset) => (
                    <div
                      key={preset.label}
                      onClick={() => {
                        setSelectedImagePreset(preset.path);
                        setCustomImageUrl("");
                      }}
                      className={`aspect-square rounded-xs border overflow-hidden cursor-pointer hover:border-muted-gold relative ${
                        selectedImagePreset === preset.path && customImageUrl === ""
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
                  ))}
                </div>
              </div>

              {/* Or custom URL */}
              <div className="flex flex-col gap-2">
                <label className="uppercase tracking-wider font-semibold text-secondary-text">Or Custom Image URL</label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="bg-primary-bg border border-border-accent p-3 rounded-xs text-primary-text outline-none focus:border-muted-gold transition-colors"
                />
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
                        <span className="text-[9px] uppercase tracking-wider text-secondary-text mt-0.5 font-sans font-medium">
                          {prod.category} • ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-secondary-text/80 leading-relaxed font-light mt-1.5 max-w-sm line-clamp-1">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-end">
                      
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

      </div>
    </div>
  );
}

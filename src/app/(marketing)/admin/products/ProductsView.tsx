"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, RefreshCw, ShoppingBag, Tag, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";
import { Product } from "@/types/product";
import { getProducts, addProduct, deleteProduct, updateProductStock, updateProductSpecs } from "@/utils/db";

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Sarees");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("/images/cat_sarees.jpg");
  const [stock, setStock] = useState("10");

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

  useEffect(() => {
    fetchProducts();
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
        description,
        imageUrl,
        stock: Number(stock),
        fabric,
        dimensions,
        garmentCut,
        artisanOrigin,
        weavingStyle,
        craftTime,
        threadCount,
        washingStandard,
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

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
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
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3">
          Add New Style
        </h3>
        
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Product Title</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Price (INR)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Stock Level</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-secondary-text font-bold mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl">
              <option value="Sarees">Sarees</option>
              <option value="Kurtis">Kurtis</option>
              <option value="Lehengas">Lehengas</option>
              <option value="Gowns">Gowns</option>
              <option value="Western Wear">Western Wear</option>
              <option value="Kids Wear">Kids Wear</option>
            </select>
          </div>

          <button type="submit" className="w-full py-3 bg-forest-green text-primary-bg text-xs uppercase font-bold rounded-xl">
            Save Style Entry
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

"use client";

import React, { useState } from "react";
import { Upload, AlertTriangle, CheckCircle2, RefreshCw, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion/FadeIn";

export function CSVImportView() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [unresolved, setUnresolved] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<{ id: string, name: string }[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [importSummary, setImportSummary] = useState<any | null>(null);

  // Raw file parser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUnresolved([]);
      setImportSummary(null);
    }
  };

  const parseCSVText = (text: string): any[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length <= 1) return [];
    
    // Extract headers
    const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ""));
    const results: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Simple comma separator handling quotes
      const values = lines[i].split(",").map(v => v.trim().replace(/^["']|["']$/g, ""));
      const rowObj: Record<string, string> = {};
      
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || "";
      });
      
      results.push(rowObj);
    }
    return results;
  };

  const handleStartImport = async (e: React.FormEvent, customMappings?: Record<string, string>) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    setUploading(true);
    try {
      const text = await csvFile.text();
      const parsedProducts = parseCSVText(text);

      if (parsedProducts.length === 0) {
        toast.error("CSV file is empty or missing headers");
        setUploading(false);
        return;
      }

      const res = await fetch("/api/import/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: parsedProducts,
          filename: csvFile.name,
          categoryMappings: customMappings || mappings
        })
      });

      const result = await res.json();

      if (!res.ok) {
        // Unresolved categories matching logic
        if (result.error?.code === "UNRESOLVED_CATEGORIES") {
          setUnresolved(result.error.unresolved || []);
          setAvailableCategories(result.error.availableCategories || []);
          toast.warning("Unmapped category titles found. Please align them below.");
        } else {
          toast.error(result.error?.message || "Failed to process CSV file.");
        }
      } else {
        toast.success(result.message || "Import completed successfully!");
        setImportSummary(result.data);
        setUnresolved([]);
        setCsvFile(null);
      }
    } catch (err) {
      toast.error("Error reading or processing CSV upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleMappingChange = (unmappedName: string, categoryId: string) => {
    setMappings(prev => ({
      ...prev,
      [unmappedName]: categoryId
    }));
  };

  const handleResolveAndRetry = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all unresolved items are mapped
    const missingKeys = unresolved.filter(u => !mappings[u]);
    if (missingKeys.length > 0) {
      toast.error("Please map all categories before retrying.");
      return;
    }
    handleStartImport(e, mappings);
  };

  return (
    <FadeIn className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* CSV Uploader panel */}
      <div className="lg:col-span-2 bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-muted-gold" />
          CSV Batch Product Uploader
        </h3>
        
        <p className="text-xs text-secondary-text font-light leading-relaxed mb-6">
          Upload a spreadsheet containing product columns: <code className="bg-primary-bg px-1.5 py-0.5 rounded border border-border-accent/20 font-mono">name, price, description, category, stock, fabric, dimensions, imageUrl</code>. Products will process in transactions of 100 rows.
        </p>

        {unresolved.length === 0 ? (
          <form onSubmit={(e) => handleStartImport(e)} className="flex flex-col gap-6 items-center justify-center border-2 border-dashed border-border-accent/30 p-10 rounded-xl bg-[#FAF8F3]/50">
            <div className="p-4 bg-primary-bg rounded-full border border-border-accent/30 shadow-xs">
              <Upload className="w-8 h-8 text-muted-gold" />
            </div>
            
            <div className="text-center">
              <input 
                type="file" 
                accept=".csv" 
                id="csv-file-input"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="csv-file-input" className="px-5 py-2.5 bg-primary-bg border border-border-accent/40 rounded-xl hover:border-muted-gold transition-colors text-xs font-bold uppercase tracking-wider text-secondary-text cursor-pointer">
                {csvFile ? csvFile.name : "Select CSV File"}
              </label>
            </div>

            {csvFile && (
              <button 
                type="submit" 
                disabled={uploading}
                className="px-8 py-3 bg-forest-green text-primary-bg text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-forest-green/90 transition-colors flex items-center gap-2 cursor-pointer"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                {uploading ? "Importing..." : "Start Import"}
              </button>
            )}
          </form>
        ) : (
          /* UNRESOLVED CATEGORY MAPPING SCREEN */
          <form onSubmit={handleResolveAndRetry} className="flex flex-col gap-6 bg-amber-500/5 border border-amber-500/20 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-serif text-sm text-primary-text font-bold mb-1">Unrecognized Categories Detected</h4>
                <p className="text-[11px] text-secondary-text">Map each category found in your CSV file to an existing category before importing can resume.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-amber-500/20 text-secondary-text uppercase tracking-wider font-bold">
                    <th className="py-2">CSV Category Title</th>
                    <th className="py-2">Map to Store Category</th>
                  </tr>
                </thead>
                <tbody>
                  {unresolved.map((unmapped) => (
                    <tr key={unmapped} className="border-b border-amber-500/10">
                      <td className="py-3 font-medium text-primary-text">{unmapped}</td>
                      <td className="py-3">
                        <select 
                          value={mappings[unmapped] || ""} 
                          onChange={(e) => handleMappingChange(unmapped, e.target.value)}
                          className="p-2 text-xs bg-primary-bg border border-border-accent/40 rounded-xl outline-none focus:border-muted-gold"
                        >
                          <option value="">-- Select Category --</option>
                          {availableCategories.map(ac => (
                            <option key={ac.id} value={ac.id}>{ac.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setUnresolved([])}
                className="px-5 py-2.5 border border-border-accent/40 rounded-xl text-xs font-bold uppercase tracking-wider text-secondary-text hover:bg-primary-bg"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={uploading}
                className="px-5 py-2.5 bg-forest-green text-primary-bg text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-forest-green/90 transition-colors flex items-center gap-2"
              >
                {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                Resume Import
              </button>
            </div>
          </form>
        )}

        {/* Success summary log */}
        {importSummary && (
          <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-serif text-sm text-primary-text font-bold mb-1">Import Job Succeeded</h4>
              <p className="text-[11px] text-secondary-text mb-2">
                Processed {importSummary.successCount + importSummary.failedCount} rows. Success count: <strong>{importSummary.successCount}</strong>, failures: <strong>{importSummary.failedCount}</strong>.
              </p>
              {importSummary.errors.length > 0 && (
                <div className="mt-2 bg-primary-bg p-3 rounded-lg border border-border-accent/15 max-h-40 overflow-y-auto font-mono text-[9px]">
                  {importSummary.errors.map((e: any, idx: number) => (
                    <div key={idx} className="text-red-700">Row {e.row || "Bulk"}: {e.error || e.message}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSV Spec sheet instructions */}
      <div className="bg-card border border-border-accent/45 p-6 rounded-2xl shadow-xs">
        <h3 className="font-serif text-lg text-primary-text mb-4 border-b border-border-accent/20 pb-3 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-muted-gold" />
          CSV Import Spec
        </h3>
        <p className="text-xs text-secondary-text leading-relaxed font-light mb-4">
          Strict schema rules ensure error-free catalog syncing. Make sure headers are spelled exactly:
        </p>
        <ul className="text-xs text-secondary-text leading-relaxed font-light flex flex-col gap-2 list-disc list-inside">
          <li><strong>name</strong>: String (Required)</li>
          <li><strong>price</strong>: Number (Required)</li>
          <li><strong>category</strong>: Matching name or mapped option</li>
          <li><strong>imageUrl</strong>: Public file asset link</li>
          <li><strong>fabric, weave, artisan</strong>: Custom specifications</li>
        </ul>
      </div>
    </FadeIn>
  );
}

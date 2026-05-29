"use client";

import { useState, useRef, type FormEvent, type DragEvent } from "react";
import { useMintNft } from "@/hooks/use-contract-write";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  X,
} from "lucide-react";
import Link from "next/link";

export function MintForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mint, isPending, isConfirming, isSuccess, error, txHash, reset } =
    useMintNft();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const metadata = JSON.stringify({
      name: name.trim(),
      description: description.trim(),
      image: imagePreview || "",
    });

    const tokenURI = `data:application/json;base64,${btoa(metadata)}`;
    mint(tokenURI);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-10 animate-fade-in font-sans">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-6 border border-indigo-100">
          <CheckCircle2 className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-display font-extrabold mb-2 text-slate-900 tracking-tight">Artifact Minted Successfully</h2>
        <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto leading-relaxed">
          Your digital artifact has been cryptographically signed and registered on the Ethereum ledger.
        </p>
        {txHash && (
          <p className="text-[10px] font-mono text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 rounded-xl px-4 py-3 mb-8 break-all max-w-sm mx-auto select-all">
            TX HASH: {txHash}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link href="/marketplace" className="btn-primary">
            Go to Marketplace
          </Link>
          <button
            onClick={() => {
              reset();
              setName("");
              setDescription("");
              setImagePreview(null);
            }}
            className="btn-secondary"
          >
            Mint Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {/* Image Upload */}
      <div>
        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 text-slate-400">
          Digital Artwork <span className="text-slate-400 font-normal font-sans">(optional)</span>
        </label>
        {imagePreview ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100/60 bg-slate-50 shadow-inner p-2 bg-white">
            <div className="w-full h-full relative rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/90 hover:bg-white border border-slate-100 text-slate-500 hover:text-rose-500 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? "border-indigo-500 bg-indigo-50/40"
                : "border-slate-200 bg-white/40 hover:border-indigo-400 hover:bg-white/60"
            }`}
          >
            <ImagePlus className="w-9 h-9 mb-3 text-slate-400 transition-transform duration-300 hover:scale-105" />
            <p className="text-sm text-slate-800 font-display font-semibold tracking-wide">
              Drag & drop dynamic files, or click to browse
            </p>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1.5">
              PNG, JPG, GIF, SVG, WEBP (MAX 10MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          className="hidden"
        />
      </div>

      {/* Name */}
      <div>
        <label htmlFor="nft-name" className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 text-slate-400">
          Specimen Name <span className="text-rose-500 font-normal">*</span>
        </label>
        <input
          id="nft-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Prism Shield"
          required
          className="input"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="nft-description" className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 text-slate-400">
          Metadata Description
        </label>
        <textarea
          id="nft-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a dynamic metadata description for your ledger-registered token..."
          rows={4}
          className="input"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
          <span className="font-medium">{error.message}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!name.trim() || isPending || isConfirming}
        className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-semibold"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin text-white" /> Confirming in wallet…</>
        ) : isConfirming ? (
          <><Loader2 className="w-4 h-4 animate-spin text-white" /> Registering on ledger…</>
        ) : (
          <><Upload className="w-4 h-4" /> Mint Artifact</>
        )}
      </button>
    </form>
  );
}

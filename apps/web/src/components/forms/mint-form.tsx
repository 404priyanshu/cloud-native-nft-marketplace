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
      <div className="text-center py-8 animate-fade-in font-sans">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(6,182,212,0.1)] mb-6 border border-[var(--color-cyber-cyan)]/30 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-pulse">
          <CheckCircle2 className="w-8 h-8 text-[var(--color-cyber-cyan)]" />
        </div>
        <h2 className="text-2xl font-display font-extrabold mb-2 text-white glow-text-cyan">Artifact Cryptographically Minted</h2>
        <p className="text-gray-400 mb-6 text-sm max-w-sm mx-auto leading-relaxed">
          Your digital specimen has been uploaded and successfully registered on the Ethereum blockchain.
        </p>
        {txHash && (
          <p className="text-[10px] font-mono text-[var(--color-cyber-cyan)] bg-[rgba(6,182,212,0.05)] border border-[rgba(6,182,212,0.15)] rounded-md px-3 py-2.5 mb-6 break-all max-w-sm mx-auto select-all">
            TX HASH: {txHash}
          </p>
        )}
        <div className="flex items-center justify-center gap-3">
          <Link href="/marketplace" className="btn-primary">
            View Marketplace
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
        <label className="block text-xs font-display font-bold uppercase tracking-widest mb-2 text-gray-300">
          Digital Artwork <span className="text-gray-500 font-normal font-sans">(optional)</span>
        </label>
        {imagePreview ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-space-charcoal)] shadow-[0_0_15px_rgba(0,0,0,0.4)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
              }}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-[var(--color-space-black)] hover:bg-black/80 border border-[var(--color-border)] text-white transition-colors"
            >
              <X className="w-4 h-4 text-[var(--color-cyber-magenta)]" />
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
            className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragOver
                ? "border-[var(--color-cyber-cyan)] bg-[rgba(6,182,212,0.05)] shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                : "border-[var(--color-border)] hover:border-[var(--color-cyber-indigo)] hover:bg-[rgba(255,255,255,0.01)]"
            }`}
          >
            <ImagePlus className="w-10 h-10 mb-3 text-gray-500 transition-transform group-hover:scale-105" />
            <p className="text-sm text-gray-300 font-display font-semibold tracking-wide">
              Drag & drop files or click to browse
            </p>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1.5">
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
        <label htmlFor="nft-name" className="block text-xs font-display font-bold uppercase tracking-widest mb-2 text-gray-300">
          Specimen Name <span className="text-[var(--color-cyber-magenta)] font-normal">*</span>
        </label>
        <input
          id="nft-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Neo-Holographic Shard"
          required
          className="input"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="nft-description" className="block text-xs font-display font-bold uppercase tracking-widest mb-2 text-gray-300">
          Decentralized Description
        </label>
        <textarea
          id="nft-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a cryptographic description for your indexed dynamic token..."
          rows={4}
          className="input"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-200 bg-[rgba(239,68,68,0.1)] border border-red-900/50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!name.trim() || isPending || isConfirming}
        className="btn-primary w-full py-3"
      >
        {isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Confirming in wallet…</>
        ) : isConfirming ? (
          <><Loader2 className="w-4 h-4 animate-spin animate-pulse" /> Registering on ledger…</>
        ) : (
          <><Upload className="w-4 h-4 text-[var(--color-cyber-cyan)]" /> Mint Cyber Artifact</>
        )}
      </button>
    </form>
  );
}

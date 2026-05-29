"use client";

import { useState } from "react";
import { useListings } from "@/hooks/use-api";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import type { ListingStatus } from "@/types/api";
import { SlidersHorizontal } from "lucide-react";

const STATUS_OPTIONS: { label: string; value: ListingStatus | undefined }[] = [
  { label: "All Specimen", value: undefined },
  { label: "Active Escrow", value: "ACTIVE" },
  { label: "Sold Ledger", value: "SOLD" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function MarketplacePage() {
  const [statusFilter, setStatusFilter] = useState<ListingStatus | undefined>(
    "ACTIVE"
  );
  const { data: listings, isLoading } = useListings(statusFilter);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto font-sans bg-[var(--color-space-black)]">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-6 relative">
        <div className="absolute -top-10 left-[20%] w-[200px] h-[200px] rounded-full bg-[var(--color-cyber-cyan)] opacity-[0.03] blur-[80px] pointer-events-none" />
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold mb-2 text-white">
          The Marketplace <span className="glow-text-grad font-extrabold">Catalog</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Browse and inspect digital specimens listed on the BlockForge decentralized escrow contract.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)] animate-pulse" />
          <span>Status filter:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                statusFilter === opt.value
                  ? "bg-[linear-gradient(135deg,var(--color-cyber-indigo),var(--color-cyber-cyan))] border-transparent text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  : "bg-[rgba(255,255,255,0.02)] border-[var(--color-border)] text-gray-400 hover:border-gray-500 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <ListingGrid
        listings={listings ?? []}
        isLoading={isLoading}
        emptyMessage={
          statusFilter
            ? `No ${statusFilter.toLowerCase()} listings found in catalog.`
            : "No catalog listings found."
        }
      />
    </div>
  );
}

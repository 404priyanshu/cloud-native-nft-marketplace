"use client";

import type { MarketplaceListing } from "@/types/api";
import { ListingCard } from "./listing-card";
import { ShoppingBag } from "lucide-react";

interface ListingGridProps {
  listings: MarketplaceListing[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function ListingGrid({
  listings,
  isLoading,
  emptyMessage = "No listings found.",
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-foreground-muted)]">
        <ShoppingBag className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {listings.map((listing, i) => (
        <div
          key={listing.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

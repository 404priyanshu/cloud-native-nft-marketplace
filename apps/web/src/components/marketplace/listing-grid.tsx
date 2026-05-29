"use client";

import type { MarketplaceListing } from "@/types/api";
import { ListingCard } from "./listing-card";
import { ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card/42 py-20 text-muted-foreground">
        <ShoppingBag className="opacity-50" />
        <p className="text-center text-sm">{emptyMessage}</p>
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
    <div className="overflow-hidden rounded-xl border border-border bg-card/72">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

"use client";

import type { NftToken, MarketplaceListing } from "@/types/api";
import { NftCard } from "./nft-card";
import { ImageOff } from "lucide-react";

interface NftGridProps {
  nfts: NftToken[];
  listings?: MarketplaceListing[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function NftGrid({
  nfts,
  listings,
  isLoading,
  emptyMessage = "No NFTs found.",
}: NftGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-foreground-muted)]">
        <ImageOff className="w-12 h-12 mb-4 opacity-40" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  // Build a lookup map: tokenId → listing
  const listingMap = new Map<string, MarketplaceListing>();
  listings?.forEach((l) => {
    listingMap.set(l.tokenId, l);
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {nfts.map((nft, i) => (
        <div
          key={nft.id}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <NftCard nft={nft} listing={listingMap.get(nft.tokenId)} />
        </div>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

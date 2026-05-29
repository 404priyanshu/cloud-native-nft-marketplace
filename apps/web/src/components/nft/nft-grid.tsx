"use client";

import type { NftToken, MarketplaceListing } from "@/types/api";
import { NftCard } from "./nft-card";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card/42 py-20 text-muted-foreground">
        <ImageOff className="opacity-50" />
        <p className="text-center text-sm">{emptyMessage}</p>
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
    <div className="overflow-hidden rounded-xl border border-border bg-card/72">
      <Skeleton className="aspect-square rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

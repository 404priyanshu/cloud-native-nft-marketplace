"use client";

import Link from "next/link";
import Image from "next/image";
import type { NftToken, MarketplaceListing } from "@/types/api";
import { truncateAddress, formatEthPrice, stringToGradient } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface NftCardProps {
  nft: NftToken;
  listing?: MarketplaceListing;
}

export function NftCard({ nft, listing }: NftCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Calculate coordinates relative to center (-10 to 10 degrees)
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 20);
    const y = -(e.clientY - rect.top - rect.height / 2) / (rect.height / 20);
    setTilt({ x, y });
  };

  return (
    <Link
      href={`/nft/${nft.id}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
      className="group cyber-glass overflow-hidden block font-sans tilt-card"
      style={{
        transform: hovered
          ? `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.03)`
          : `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`,
        transition: hovered ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-[var(--color-space-black)] border-b border-[var(--color-border)]">
        {nft.imageUrl ? (
          <Image
            src={nft.imageUrl}
            alt={nft.name || `Token #${nft.tokenId}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: stringToGradient(nft.tokenId + nft.contractAddress) }}
          >
            <span className="text-4xl font-display font-black text-white/20">
              #{nft.tokenId}
            </span>
          </div>
        )}

        {/* Price Badge */}
        {listing && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded bg-[rgba(2,4,10,0.85)] border border-[var(--color-cyber-cyan)]/30 text-xs font-mono font-bold text-[var(--color-cyber-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {formatEthPrice(listing.priceWei)} ETH
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-1">
        <h3 className="font-display font-bold text-sm truncate text-white group-hover:text-[var(--color-cyber-cyan)] transition-colors">
          {nft.name || `Token #${nft.tokenId}`}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>
            {nft.creatorAddress
              ? truncateAddress(nft.creatorAddress)
              : "Unknown"}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

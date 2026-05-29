"use client";

import Link from "next/link";
import type { MarketplaceListing } from "@/types/api";
import { truncateAddress, formatEthPrice, stringToGradient } from "@/lib/utils";
import { Tag, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ListingCardProps {
  listing: MarketplaceListing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const statusClass =
    listing.status === "ACTIVE"
      ? "badge-active"
      : listing.status === "SOLD"
      ? "badge-sold"
      : "badge-cancelled";

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 20);
    const y = -(e.clientY - rect.top - rect.height / 2) / (rect.height / 20);
    setTilt({ x, y });
  };

  return (
    <Link
      href={`/nft/${listing.id}`}
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
      {/* Gradient placeholder image */}
      <div
        className="aspect-square relative flex items-center justify-center bg-[var(--color-space-black)] border-b border-[var(--color-border)]"
        style={{
          background: stringToGradient(
            listing.tokenId + listing.nftContractAddress
          ),
        }}
      >
        <span className="text-4xl font-display font-black text-white/10 select-none">
          #{listing.tokenId}
        </span>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${statusClass}`}>{listing.status}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="flex items-center gap-2 font-display text-white">
          <Tag className="w-4 h-4 text-[var(--color-cyber-cyan)]" />
          <span className="text-lg font-bold tracking-tight">
            {formatEthPrice(listing.priceWei)}
          </span>
          <span className="text-xs font-mono font-bold text-gray-400">
            ETH
          </span>
        </div>

        {/* Seller */}
        <div className="flex items-center justify-between text-xs text-gray-400 font-mono border-t border-[var(--color-border)] pt-2.5">
          <span>Seller: {truncateAddress(listing.sellerAddress)}</span>
          <ExternalLink className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

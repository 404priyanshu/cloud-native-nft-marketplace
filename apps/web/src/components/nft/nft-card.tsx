"use client";

import Image from "next/image";
import Link from "next/link";
import type { MarketplaceListing, NftToken } from "@/types/api";
import {
  addressInitials,
  formatEthPrice,
  stringToGradient,
  truncateAddress,
} from "@/lib/utils";
import { ArrowUpRight, Compass, Tag } from "lucide-react";

interface NftCardProps {
  nft: NftToken;
  listing?: MarketplaceListing;
}

export function NftCard({ nft, listing }: NftCardProps) {
  const displayPrice = listing ? formatEthPrice(listing.priceWei) : null;
  const ownerOrCreator = nft.ownerAddress ?? nft.creatorAddress;

  return (
    <Link href={`/nft/${nft.id}`} className="group block">
      <article className="tribe-card h-full bg-white">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          {nft.imageUrl ? (
            <Image
              src={nft.imageUrl}
              alt={nft.name || `Token #${nft.tokenId}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ background: stringToGradient(nft.tokenId + nft.contractAddress) }}
            >
              <span className="font-display text-4xl font-extrabold text-white/70">
                #{nft.tokenId}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/36 via-transparent to-transparent opacity-70" />
          <div className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-display font-bold text-slate-950 shadow-sm backdrop-blur">
            Token #{nft.tokenId}
          </div>
          {displayPrice && (
            <div className="absolute right-3 top-3 rounded-full bg-indigo-50 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-700 shadow-sm">
              {displayPrice} ETH
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-base font-extrabold text-slate-950 transition-colors group-hover:text-indigo-600">
                {nft.name || `Token #${nft.tokenId}`}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {nft.description || "Indexed ERC-721 token from contract events."}
              </p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 p-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-[10px] font-bold text-white">
                {addressInitials(ownerOrCreator ?? nft.tokenId)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-[11px] font-semibold text-slate-700">
                  {ownerOrCreator ? truncateAddress(ownerOrCreator, 4) : "Unknown"}
                </p>
                <p className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Compass className="size-3 text-emerald-500" />
                  Current owner
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <Tag className="size-3 text-indigo-500" />
              {listing?.status ?? "Not listed"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

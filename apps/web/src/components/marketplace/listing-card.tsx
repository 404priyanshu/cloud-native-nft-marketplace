"use client";

import Link from "next/link";
import Image from "next/image";
import type { MarketplaceListing } from "@/types/api";
import { formatEthPrice, stringToGradient, truncateAddress } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, Clock3, Tag } from "lucide-react";

interface ListingCardProps {
  listing: MarketplaceListing;
}

function statusTone(status: MarketplaceListing["status"]) {
  if (status === "ACTIVE") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (status === "SOLD") {
    return "bg-indigo-50 text-indigo-700 border-indigo-100";
  }
  return "bg-amber-50 text-amber-700 border-amber-100";
}

export function ListingCard({ listing }: ListingCardProps) {
  const displayPrice = formatEthPrice(listing.priceWei);
  const txHash =
    listing.soldTxHash ?? listing.cancelledTxHash ?? listing.listedTxHash;
  const nftName = listing.nft?.name || `Token #${listing.tokenId}`;
  const nftImage = listing.nft?.imageUrl;
  const nftHref = listing.nft?.id ? `/nft/${listing.nft.id}` : null;

  const card = (
    <article className="tribe-card h-full bg-white">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50"
        style={
          !nftImage
            ? {
                background: stringToGradient(
                  listing.tokenId + listing.nftContractAddress
                ),
              }
            : undefined
        }
      >
        {nftImage && (
          <Image
            src={nftImage}
            alt={nftName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/42 via-transparent to-transparent opacity-80" />
        <span
          className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider ${statusTone(
            listing.status
          )}`}
        >
          {listing.status}
        </span>
        <div className="absolute bottom-3 left-3 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-display font-bold text-slate-950 shadow-sm backdrop-blur">
          Listing #{listing.listingId}
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-base font-extrabold text-slate-950 transition-colors group-hover:text-indigo-600">
              {nftName}
            </h3>
            <p className="mt-1 font-mono text-[11px] font-semibold text-slate-400">
              Seller {truncateAddress(listing.sellerAddress, 5)}
            </p>
          </div>
          {nftHref ? (
            <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
          ) : (
            <span className="rounded-full bg-amber-50 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-700">
              Metadata pending
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-2xl font-extrabold text-slate-950">
                {displayPrice}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                ETH
              </span>
            </div>
            <Tag className="size-4 text-indigo-500" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {new Date(listing.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center justify-end gap-1">
              <CheckCircle2 className="size-3" />
              {txHash ? truncateAddress(txHash, 4) : "Pending tx"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );

  if (!nftHref) {
    return <div className="group h-full">{card}</div>;
  }

  return (
    <Link href={nftHref} className="group block h-full">
      {card}
    </Link>
  );
}

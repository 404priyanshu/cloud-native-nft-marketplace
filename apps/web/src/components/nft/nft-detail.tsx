"use client";

import Image from "next/image";
import type { NftToken, MarketplaceListing } from "@/types/api";
import {
  truncateAddress,
  formatEthPrice,
  formatDate,
  stringToGradient,
} from "@/lib/utils";
import { useBuyNft, useCancelListing } from "@/hooks/use-contract-write";
import { ListForm } from "@/components/forms/list-form";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Tag,
  User,
  Hash,
  FileCode2,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";

interface NftDetailProps {
  nft: NftToken;
  listing?: MarketplaceListing;
  isOwner: boolean;
}

export function NftDetail({ nft, listing, isOwner }: NftDetailProps) {
  const { buy, isPending: isBuying, isConfirming: isBuyConfirming, isSuccess: isBought, error: buyError } = useBuyNft();
  const { cancel, isPending: isCancelling, isConfirming: isCancelConfirming, isSuccess: isCancelled, error: cancelError } = useCancelListing();
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const isActiveListing = listing && listing.status === "ACTIVE";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 font-sans pt-6">
      {/* Left Column: Framed Image with Premium Outline */}
      <div className="relative group animate-fade-in">
        <div className="tribe-card p-5 relative overflow-hidden bg-white">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-50 border border-slate-100/50 shadow-inner">
            {nft.imageUrl ? (
              <Image
                src={nft.imageUrl}
                alt={nft.name || `Token #${nft.tokenId}`}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: stringToGradient(nft.tokenId + nft.contractAddress) }}
              >
                <span className="text-6xl font-display font-black text-slate-800">
                  #{nft.tokenId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Editorial metadata & Actions */}
      <div className="space-y-8 animate-fade-in" style={{ animationDelay: "0.15s" }}>
        {/* Title + Status */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/40">
              ERC-721 Token
            </span>
            {listing && (
              <span
                className={`badge ${
                  listing.status === "ACTIVE"
                    ? "badge-active"
                    : listing.status === "SOLD"
                    ? "badge-sold"
                    : "badge-cancelled"
                }`}
              >
                {listing.status}
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 leading-tight tracking-tight">
            {nft.name || `Token #${nft.tokenId}`}
          </h1>
        </div>

        {/* Description */}
        {nft.description && (
          <p className="text-slate-600 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-sm leading-relaxed italic shadow-sm">
            &quot;{nft.description}&quot;
          </p>
        )}

        {/* Price + Action Box */}
        {isActiveListing && (
          <div className="tribe-card p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">Current Trade Price</p>
                <p className="text-3.5xl font-display font-extrabold text-slate-900 mt-1">
                  {formatEthPrice(listing.priceWei)} <span className="text-sm font-mono font-bold text-indigo-600">ETH</span>
                </p>
              </div>
              <div className="size-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Tag className="size-5 text-indigo-600" />
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={() =>
                  buy(BigInt(listing.listingId), BigInt(listing.priceWei))
                }
                disabled={isBuying || isBuyConfirming || isBought}
                className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-bold h-12"
              >
                {isBuying ? (
                  <><Loader2 className="size-4 animate-spin text-white" /> Confirming in wallet…</>
                ) : isBuyConfirming ? (
                  <><Loader2 className="size-4 animate-spin text-white" /> Clearing Ledger transaction…</>
                ) : isBought ? (
                  <><CheckCircle2 className="size-4" /> Staged and Acquired!</>
                ) : (
                  <><Tag className="size-4" /> Acquire Specimen</>
                )}
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => cancel(BigInt(listing.listingId))}
                disabled={isCancelling || isCancelConfirming || isCancelled}
                className="btn-danger w-full py-3.5 text-xs uppercase tracking-wider font-bold h-12 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100 rounded-full"
              >
                {isCancelling ? (
                  <><Loader2 className="size-4 animate-spin text-rose-500" /> Confirming…</>
                ) : isCancelConfirming ? (
                  <><Loader2 className="size-4 animate-spin text-rose-500" /> Relinquishing escrow…</>
                ) : isCancelled ? (
                  <><CheckCircle2 className="size-4" /> Relinquished</>
                ) : (
                  "Relinquish Escrow"
                )}
              </button>
            )}

            {(buyError || cancelError) && (
              <div className="flex items-start gap-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3.5">
                <AlertCircle className="size-4 mt-0.5 shrink-0 text-rose-500" />
                <span className="font-medium">{(buyError || cancelError)?.message}</span>
              </div>
            )}
          </div>
        )}

        {/* List for Sale (if owner and not listed) */}
        {isOwner && !isActiveListing && (
          <div className="tribe-card p-6 bg-white">
            <h3 className="text-md font-display font-extrabold mb-4 border-b border-slate-100 pb-3 text-slate-900 flex items-center gap-2">
              <Tag className="size-4.5 text-indigo-500" />
              Stage Listing Contract
            </h3>
            <ListForm nft={nft} />
          </div>
        )}

        {/* Details Table */}
        <div className="tribe-card p-6 bg-white">
          <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-3">
            Ledger Metadata
          </h3>
          <table className="kami-table financial compact w-full">
            <tbody>
              <MetaRow icon={<Hash className="size-3.5" />} label="Token ID Spec" value={nft.tokenId} />
              <MetaRow
                icon={<FileCode2 className="size-3.5" />}
                label="Contract Address"
                value={truncateAddress(nft.contractAddress, 5)}
                copyValue={nft.contractAddress}
                copied={copiedLabel === "Contract Address"}
                onCopy={(v) => handleCopy(v, "Contract Address")}
              />
              <MetaRow
                icon={<User className="size-3.5" />}
                label="Creator Origin"
                value={nft.creatorAddress ? truncateAddress(nft.creatorAddress) : "—"}
                copyValue={nft.creatorAddress ?? undefined}
                copied={copiedLabel === "Creator Origin"}
                onCopy={(v) => handleCopy(v, "Creator Origin")}
              />
              <MetaRow
                icon={<User className="size-3.5" />}
                label="Owner Custody"
                value={nft.ownerAddress ? truncateAddress(nft.ownerAddress) : "—"}
                copyValue={nft.ownerAddress ?? undefined}
                copied={copiedLabel === "Owner Custody"}
                onCopy={(v) => handleCopy(v, "Owner Custody")}
              />
              {nft.tokenUri && (
                <MetaRow
                  icon={<LinkIcon className="size-3.5" />}
                  label="Token URI Payload"
                  value={nft.tokenUri.length > 30 ? nft.tokenUri.slice(0, 30) + "…" : nft.tokenUri}
                  copyValue={nft.tokenUri}
                  copied={copiedLabel === "Token URI Payload"}
                  onCopy={(v) => handleCopy(v, "Token URI Payload")}
                />
              )}
              <MetaRow
                icon={<Hash className="size-3.5" />}
                label="Ledger Entry Date"
                value={formatDate(nft.createdAt)}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  label,
  value,
  copyValue,
  copied,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyValue?: string;
  copied?: boolean;
  onCopy?: (v: string) => void;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-3 pl-0 pr-2 flex items-center gap-2 text-slate-500 font-sans font-medium text-xs">
        <span className="text-indigo-500">{icon}</span>
        <span>{label}</span>
      </td>
      <td className="py-3 pl-2 pr-0 text-right font-mono text-slate-700 text-xs">
        <div className="inline-flex items-center gap-2 justify-end">
          <span>{value}</span>
          {copyValue && onCopy && (
            <button
              onClick={() => onCopy(copyValue)}
              className="p-1 rounded-md hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-600 border border-transparent"
              aria-label={`Copy ${label}`}
            >
              {copied ? (
                <span className="text-[9px] font-sans font-bold text-indigo-600 uppercase tracking-wider">Copied</span>
              ) : (
                <Copy className="size-3" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

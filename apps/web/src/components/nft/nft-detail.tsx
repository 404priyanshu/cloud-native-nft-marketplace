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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 font-sans">
      {/* Left Column: Framed Image with Backdrop Glowing Mesh */}
      <div className="relative group">
        {/* Pulsing Backlit Cyan/Magenta Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-magenta)] opacity-10 blur-3xl group-hover:opacity-20 transition-opacity pointer-events-none rounded-xl" />

        <div className="cyber-glass p-4 relative overflow-hidden shadow-2xl border border-[var(--color-border-glow)] animate-float">
          <div className="w-full aspect-square relative rounded-lg overflow-hidden border border-white/5 shadow-inner bg-[var(--color-space-black)]">
            {nft.imageUrl ? (
              <Image
                src={nft.imageUrl}
                alt={nft.name || `Token #${nft.tokenId}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: stringToGradient(nft.tokenId + nft.contractAddress) }}
              >
                <span className="text-6xl font-display font-black text-white/20">
                  #{nft.tokenId}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Editorial metadata & Actions */}
      <div className="space-y-6">
        {/* Title + Status */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight">
            {nft.name || `Token #${nft.tokenId}`}
          </h1>
          {listing && (
            <div>
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
            </div>
          )}
        </div>

        {/* Description */}
        {nft.description && (
          <p className="text-gray-300 bg-[rgba(255,255,255,0.015)] border border-[var(--color-border)] rounded-md px-4 py-3 text-sm leading-relaxed italic">
            &quot;{nft.description}&quot;
          </p>
        )}

        {/* Price + Action Box */}
        {isActiveListing && (
          <div className="cyber-glass-glow p-6 space-y-4 border border-[var(--color-cyber-magenta)]/30 bg-[rgba(10,14,26,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">Current Trade Price</p>
                <p className="text-3xl font-display font-black text-white mt-1">
                  {formatEthPrice(listing.priceWei)} <span className="text-xs font-mono font-bold text-[var(--color-cyber-cyan)]">ETH</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[var(--color-cyber-cyan)]/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <Tag className="w-5 h-5 text-[var(--color-cyber-cyan)]" />
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={() =>
                  buy(BigInt(listing.listingId), BigInt(listing.priceWei))
                }
                disabled={isBuying || isBuyConfirming || isBought}
                className="btn-primary w-full py-3 text-xs"
              >
                {isBuying ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[var(--color-cyber-cyan)]" /> Confirming in wallet…</>
                ) : isBuyConfirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[var(--color-cyber-cyan)]" /> Clearing Ledger transaction…</>
                ) : isBought ? (
                  <><CheckCircle2 className="w-4 h-4" /> Staged and Acquired!</>
                ) : (
                  <><Tag className="w-4 h-4" /> Acquire Specimen</>
                )}
              </button>
            )}

            {isOwner && (
              <button
                onClick={() => cancel(BigInt(listing.listingId))}
                disabled={isCancelling || isCancelConfirming || isCancelled}
                className="btn-danger w-full py-3 text-xs"
              >
                {isCancelling ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[var(--color-cyber-magenta)]" /> Confirming…</>
                ) : isCancelConfirming ? (
                  <><Loader2 className="w-4 h-4 animate-spin text-[var(--color-cyber-magenta)]" /> Relinquishing escrow…</>
                ) : isCancelled ? (
                  <><CheckCircle2 className="w-4 h-4" /> Relinquished</>
                ) : (
                  "Relinquish Escrow"
                )}
              </button>
            )}

            {(buyError || cancelError) && (
              <div className="flex items-start gap-2 text-sm text-red-200 bg-[rgba(239,68,68,0.1)] border border-red-900/50 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{(buyError || cancelError)?.message}</span>
              </div>
            )}
          </div>
        )}

        {/* List for Sale (if owner and not listed) */}
        {isOwner && !isActiveListing && (
          <div className="cyber-glass p-6 border border-[var(--color-cyber-indigo)]/30">
            <h3 className="text-base font-display font-extrabold mb-4 border-b border-[var(--color-border)] pb-2 text-white glow-text-cyan">Staged Listing Contracts</h3>
            <ListForm nft={nft} />
          </div>
        )}

        {/* Details Table */}
        <div className="cyber-glass p-6">
          <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-[var(--color-border)] pb-2">
            Ledger Metadata
          </h3>
          <table className="kami-table financial compact">
            <tbody>
              <MetaRow icon={<Hash className="w-3.5 h-3.5" />} label="Token ID Spec" value={nft.tokenId} />
              <MetaRow
                icon={<FileCode2 className="w-3.5 h-3.5" />}
                label="Contract Address"
                value={truncateAddress(nft.contractAddress, 5)}
                copyValue={nft.contractAddress}
                copied={copiedLabel === "Contract Address"}
                onCopy={(v) => handleCopy(v, "Contract Address")}
              />
              <MetaRow
                icon={<User className="w-3.5 h-3.5" />}
                label="Creator Origin"
                value={nft.creatorAddress ? truncateAddress(nft.creatorAddress) : "—"}
                copyValue={nft.creatorAddress ?? undefined}
                copied={copiedLabel === "Creator Origin"}
                onCopy={(v) => handleCopy(v, "Creator Origin")}
              />
              <MetaRow
                icon={<User className="w-3.5 h-3.5" />}
                label="Owner Custody"
                value={nft.ownerAddress ? truncateAddress(nft.ownerAddress) : "—"}
                copyValue={nft.ownerAddress ?? undefined}
                copied={copiedLabel === "Owner Custody"}
                onCopy={(v) => handleCopy(v, "Owner Custody")}
              />
              {nft.tokenUri && (
                <MetaRow
                  icon={<LinkIcon className="w-3.5 h-3.5" />}
                  label="Token URI Payload"
                  value={nft.tokenUri.length > 30 ? nft.tokenUri.slice(0, 30) + "…" : nft.tokenUri}
                  copyValue={nft.tokenUri}
                  copied={copiedLabel === "Token URI Payload"}
                  onCopy={(v) => handleCopy(v, "Token URI Payload")}
                />
              )}
              <MetaRow
                icon={<Hash className="w-3.5 h-3.5" />}
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
    <tr className="border-b border-white/[0.02] last:border-0">
      <td className="py-2.5 pl-0 pr-2 flex items-center gap-2 text-gray-400 font-sans font-medium text-xs">
        <span className="text-[var(--color-cyber-cyan)]">{icon}</span>
        <span>{label}</span>
      </td>
      <td className="py-2.5 pl-2 pr-0 text-right font-mono text-white text-xs">
        <div className="inline-flex items-center gap-1.5 justify-end">
          <span>{value}</span>
          {copyValue && onCopy && (
            <button
              onClick={() => onCopy(copyValue)}
              className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors text-gray-400 hover:text-[var(--color-cyber-cyan)] border border-transparent"
              aria-label={`Copy ${label}`}
            >
              {copied ? (
                <span className="text-[9px] font-sans font-bold text-[var(--color-cyber-cyan)] uppercase tracking-wider">Copied</span>
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

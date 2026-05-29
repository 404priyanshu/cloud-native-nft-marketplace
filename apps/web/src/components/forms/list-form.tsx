"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { NftToken } from "@/types/api";
import { useListNft } from "@/hooks/use-contract-write";
import { NFT_CONTRACT_ADDRESS } from "@/lib/contracts";
import { Loader2, CheckCircle2, AlertCircle, Tag } from "lucide-react";
import type { Address } from "viem";

interface ListFormProps {
  nft: NftToken;
}

export function ListForm({ nft }: ListFormProps) {
  const [priceEth, setPriceEth] = useState("");
  const {
    approveListing,
    submitListing,
    isApproving,
    isApproveConfirming,
    isApproved,
    isListing,
    isListConfirming,
    isListed,
    approveError,
    listError,
    reset,
  } = useListNft();

  // After approval is confirmed, submit the listing
  useEffect(() => {
    if (isApproved && priceEth && !isListing && !isListed) {
      const contractAddr = (nft.contractAddress || NFT_CONTRACT_ADDRESS) as Address;
      submitListing(contractAddr, BigInt(nft.tokenId), priceEth);
    }
  }, [isApproved, priceEth, nft, submitListing, isListing, isListed]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!priceEth || parseFloat(priceEth) <= 0) return;
    const contractAddr = (nft.contractAddress || NFT_CONTRACT_ADDRESS) as Address;
    approveListing(contractAddr, BigInt(nft.tokenId));
  };

  if (isListed) {
    return (
      <div className="text-center py-4 animate-fade-in font-sans">
        <CheckCircle2 className="w-8 h-8 text-[var(--color-cyber-cyan)] mx-auto mb-3 animate-pulse" />
        <p className="font-display font-bold text-white mb-1">Decentralized Escrow Staged!</p>
        <p className="text-xs text-gray-400">
          Your specimen is now listed for trading on the public ledger.
        </p>
        <button onClick={reset} className="btn-secondary mt-4 text-xs font-bold uppercase tracking-wider">
          Done
        </button>
      </div>
    );
  }

  const error = approveError || listError;
  const currentStep = isApproving || isApproveConfirming
    ? 1
    : isListing || isListConfirming
    ? 2
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans">
      {/* Price Input */}
      <div>
        <label htmlFor="listing-price" className="block text-xs font-display font-bold uppercase tracking-widest mb-2 text-gray-300">
          Listing Price (ETH)
        </label>
        <div className="relative">
          <input
            id="listing-price"
            type="number"
            step="0.001"
            min="0"
            value={priceEth}
            onChange={(e) => setPriceEth(e.target.value)}
            placeholder="0.1"
            required
            disabled={currentStep > 0}
            className="input pr-14"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[var(--color-cyber-cyan)]">
            ETH
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      {currentStep > 0 && (
        <div className="space-y-2.5 text-xs py-3 border-t border-b border-[var(--color-border)] my-4">
          <StepLine
            step={1}
            label="Approve ERC-721 Custody"
            active={currentStep === 1}
            done={isApproved}
          />
          <StepLine
            step={2}
            label="Establish Escrow Contract"
            active={currentStep === 2}
            done={isListed}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-200 bg-[rgba(239,68,68,0.1)] border border-red-900/50 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={
          !priceEth ||
          parseFloat(priceEth) <= 0 ||
          currentStep > 0
        }
        className="btn-primary w-full py-2.5"
      >
        {currentStep > 0 ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing Ledger…</>
        ) : (
          <><Tag className="w-4 h-4 text-[var(--color-cyber-cyan)]" /> Approve & List Specimen</>
        )}
      </button>
    </form>
  );
}

function StepLine({
  step,
  label,
  active,
  done,
}: {
  step: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
          done
            ? "bg-[rgba(6,182,212,0.1)] text-[var(--color-cyber-cyan)] border-[var(--color-cyber-cyan)] shadow-[0_0_10px_rgba(6,182,212,0.2)]"
            : active
            ? "bg-[rgba(79,70,229,0.1)] text-[var(--color-cyber-indigo)] border-[var(--color-cyber-indigo)] animate-pulse"
            : "bg-white/5 text-gray-500 border-white/10"
        }`}
      >
        {done ? "✓" : step}
      </div>
      <span
        className={
          done
            ? "text-[var(--color-cyber-cyan)] font-semibold"
            : active
            ? "text-white font-semibold"
            : "text-gray-500"
        }
      >
        {label}
        {active && (
          <Loader2 className="w-3 h-3 animate-spin inline ml-1.5 text-[var(--color-cyber-indigo)]" />
        )}
      </span>
    </div>
  );
}

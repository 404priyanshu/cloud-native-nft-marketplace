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
      <div className="text-center py-6 animate-fade-in font-sans">
        <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
        <p className="font-display font-extrabold text-slate-900 mb-1">Escrow Listing Established!</p>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Your NFT is now staged in the marketplace contract and listed for public trade.
        </p>
        <button onClick={reset} className="btn-secondary mt-4 text-xs font-semibold uppercase tracking-wider">
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
        <label htmlFor="listing-price" className="block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 text-slate-400">
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-indigo-600">
            ETH
          </span>
        </div>
      </div>

      {/* Step Indicator */}
      {currentStep > 0 && (
        <div className="space-y-3 text-xs py-4 border-t border-b border-slate-100/60 my-4">
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
        <div className="flex items-start gap-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
          <span className="font-medium">{error.message}</span>
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
        className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider font-semibold"
      >
        {currentStep > 0 ? (
          <><Loader2 className="w-4 h-4 animate-spin text-white" /> Processing Ledger…</>
        ) : (
          <><Tag className="w-4 h-4" /> Approve & List Artifact</>
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
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border ${
          done
            ? "bg-indigo-50 text-indigo-600 border-indigo-200"
            : active
            ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
            : "bg-slate-50 text-slate-400 border-slate-200"
        }`}
      >
        {done ? "✓" : step}
      </div>
      <span
        className={`text-xs ${
          done
            ? "text-indigo-600 font-semibold"
            : active
            ? "text-slate-800 font-semibold"
            : "text-slate-400"
        }`}
      >
        {label}
        {active && (
          <Loader2 className="w-3 h-3 animate-spin inline-block ml-2 text-indigo-600" />
        )}
      </span>
    </div>
  );
}

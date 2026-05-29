"use client";

import { useParams } from "next/navigation";
import { useNft, useListings } from "@/hooks/use-api";
import { NftDetail } from "@/components/nft/nft-detail";
import { useAccount } from "wagmi";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NftDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { address } = useAccount();

  const { data: nft, isLoading, error } = useNft(id);
  const { data: listings } = useListings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 bg-[var(--color-space-black)] min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-cyber-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400 bg-[var(--color-space-black)] font-sans min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-indigo)] opacity-[0.03] blur-3xl pointer-events-none" />
        <AlertCircle className="w-12 h-12 mb-4 text-red-500 animate-bounce" />
        <h2 className="text-xl font-display font-extrabold mb-2 text-white">Artifact Not Found</h2>
        <p className="mb-6 text-xs text-gray-400 max-w-sm text-center leading-relaxed font-mono">
          This digital specimen cannot be found on the decentralized ledger. It may not exist or has not been indexed yet.
        </p>
        <Link href="/marketplace" className="btn-primary">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  // Find the active listing for this NFT
  const listing = listings?.find(
    (l) =>
      l.tokenId === nft.tokenId &&
      l.nftContractAddress.toLowerCase() === nft.contractAddress.toLowerCase() &&
      l.status === "ACTIVE"
  );

  const isOwner =
    !!address &&
    nft.ownerAddress?.toLowerCase() === address.toLowerCase();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto animate-fade-in font-sans bg-[var(--color-space-black)]">
      <NftDetail nft={nft} listing={listing} isOwner={isOwner} />
    </div>
  );
}

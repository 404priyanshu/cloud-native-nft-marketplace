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
      <div className="flex items-center justify-center py-32 min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-500 font-sans min-h-screen relative overflow-hidden">
        <AlertCircle className="w-12 h-12 mb-4 text-rose-500 animate-bounce" />
        <h2 className="text-xl font-display font-extrabold mb-2 text-slate-900 tracking-tight">Artifact Not Found</h2>
        <p className="mb-6 text-xs text-slate-500 max-w-sm text-center leading-relaxed font-mono">
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
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-6xl mx-auto animate-fade-in font-sans">
      <NftDetail nft={nft} listing={listing} isOwner={isOwner} />
    </div>
  );
}

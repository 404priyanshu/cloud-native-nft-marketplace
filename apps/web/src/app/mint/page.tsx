"use client";

import { MintForm } from "@/components/forms/mint-form";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles, Wallet } from "lucide-react";

export default function MintPage() {
  const { isConnected } = useAccount();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-10 text-center relative animate-fade-in">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 mb-4 text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-display font-extrabold mb-2 text-slate-900 tracking-tight">
          Mint NFT Artifact
        </h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Create an ERC-721 token on-chain. Our cloud-native indexer will process the minted event
          and instantly publish it to the read API.
        </p>
      </div>

      {/* Content */}
      {isConnected ? (
        <div className="aurora-glass p-8 animate-fade-in border border-white/60 bg-white/40 shadow-lg">
          <MintForm />
        </div>
      ) : (
        <div className="aurora-glass p-12 text-center animate-fade-in border border-white/60 shadow-lg relative overflow-hidden bg-white/40">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Wallet className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-display font-extrabold mb-3 text-slate-900 tracking-tight">Connect Your Wallet</h2>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Please connect your Ethereum wallet to sign the minting transaction and register your new specimen on the ledger.
          </p>
          <div className="flex justify-center rounded-full overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  );
}

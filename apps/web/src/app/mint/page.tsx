"use client";

import { MintForm } from "@/components/forms/mint-form";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sparkles, Wallet } from "lucide-react";

export default function MintPage() {
  const { isConnected } = useAccount();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-2xl mx-auto font-sans bg-[var(--color-space-black)]">
      {/* Header */}
      <div className="mb-10 text-center relative">
        <div className="absolute -top-10 left-[40%] w-[150px] h-[150px] rounded-full bg-[var(--color-cyber-cyan)] opacity-[0.03] blur-[80px] pointer-events-none" />
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] mb-4 text-[var(--color-cyber-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Sparkles className="w-5 h-5" />
        </div>
        <h1 className="text-3xl font-display font-extrabold mb-2 text-white">
          Mint Cyber <span className="glow-text-grad font-extrabold">Artifact</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Publish a unique digital specimen as an ERC-721 token on the decentralized blockchain.
        </p>
      </div>

      {/* Content */}
      {isConnected ? (
        <div className="cyber-glass p-8 animate-fade-in border border-[var(--color-cyber-indigo)]/20 bg-[rgba(10,15,30,0.5)]">
          <MintForm />
        </div>
      ) : (
        <div className="cyber-glass p-12 text-center animate-fade-in border border-[var(--color-cyber-cyan)]/20 shadow-2xl relative overflow-hidden bg-[rgba(10,15,30,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-indigo)] opacity-[0.03] blur-3xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f1efe8] border border-[var(--color-border)] mb-6 bg-[rgba(255,255,255,0.05)] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Wallet className="w-6 h-6 text-gray-300" />
          </div>
          <h2 className="text-xl font-display font-extrabold mb-3 text-white">Connect Your Wallet</h2>
          <p className="text-xs text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
            You need to connect an Ethereum wallet to mint digital specimens. Your wallet will sign the transaction and authorize the gas fee.
          </p>
          <div className="flex justify-center shadow-[0_0_15px_rgba(79,70,229,0.15)] rounded-md overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  );
}

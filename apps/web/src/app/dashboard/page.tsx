"use client";

import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserNfts, useUserListings } from "@/hooks/use-api";
import { NftGrid } from "@/components/nft/nft-grid";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import {
  Wallet,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Copy,
  ChevronRight,
  DatabaseZap,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { addressInitials, stringToGradient, truncateAddress } from "@/lib/utils";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const [copied, setCopied] = useState(false);

  const { data: nfts, isLoading: isNftsLoading } = useUserNfts(
    address?.toLowerCase()
  );
  const { data: listings, isLoading: isListingsLoading } = useUserListings(
    address?.toLowerCase()
  );

  const activeListings = listings?.filter((l) => l.status === "ACTIVE") ?? [];

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-20 max-w-lg mx-auto text-center font-sans">
        <div className="tribe-card p-10 sm:p-14 animate-fade-in border border-slate-100 shadow-lg relative overflow-hidden bg-white">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border border-slate-100 mb-6 shadow-inner">
            <Wallet className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-display font-extrabold mb-3 text-slate-900 tracking-tight">Wallet Dashboard</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Please connect your Ethereum wallet to inspect owned NFTs, manage active listing contracts, and query pending trades.
          </p>
          <div className="flex justify-center rounded-full overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-10 border-b border-slate-100 pb-6 relative animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-9 rounded-full bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100/50 shadow-sm">
            <LayoutDashboard className="size-4.5 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
        </div>
        <p className="text-slate-500 text-sm">
          Manage your minted NFTs and marketplace listings on-chain.
        </p>
      </div>

      {/* Side-by-Side Dashboard Layout mimicking TribeOne Screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

        {/* Left Side: Owned NFTs and Listings */}
        <div className="space-y-12">

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
            <Link
              href="/mint"
              className="tribe-card p-6 flex items-center gap-4 group transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Mint Artifact
                </h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  Create new digital token
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>

            <Link
              href={`/profile/${address}`}
              className="tribe-card p-6 flex items-center gap-4 group transition-all duration-300 bg-white"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-teal-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-extrabold text-sm text-slate-900 group-hover:text-teal-500 transition-colors">
                  Public Profile
                </h3>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  View your public catalog
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
            </Link>
          </div>

          {/* Stats Analytics */}
          <div className="animate-fade-in animate-delay-75">
            <h2 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-4">
              Ledger Analytics
            </h2>
            <div className="glance-grid">
              <div className="glance-cell border-l-4 border-indigo-500">
                <div className="glance-label">OWNED SPECIMEN</div>
                <div className="glance-value text-slate-900">{nfts?.length ?? "0"}</div>
                <div className="glance-note">NFTs in local wallet</div>
              </div>
              <div className="glance-cell border-l-4 border-teal-500">
                <div className="glance-label">ACTIVE ESCROW</div>
                <div className="glance-value text-slate-900">{activeListings.length}</div>
                <div className="glance-note">Listings pending trade</div>
              </div>
              <div className="glance-cell border-l-4 border-slate-900">
                <div className="glance-label">TOTAL LISTINGS</div>
                <div className="glance-value text-slate-900">{listings?.length ?? "0"}</div>
                <div className="glance-note">Listings returned by indexed API</div>
              </div>
            </div>
          </div>

          {/* Owned NFTs */}
          <section className="border-t border-slate-100 pt-8 animate-fade-in animate-delay-100">
            <h2 className="text-xl font-display font-extrabold mb-6 text-slate-950">Owned NFTs</h2>
            <NftGrid
              nfts={nfts ?? []}
              isLoading={isNftsLoading}
              emptyMessage="You do not own any NFTs yet. Mint one to get started."
            />
          </section>

          {/* Active Listings */}
          {activeListings.length > 0 && (
            <section className="border-t border-slate-100 pt-8 animate-fade-in animate-delay-150">
              <h2 className="text-xl font-display font-extrabold mb-6 text-slate-950">Active Listings</h2>
              <ListingGrid
                listings={activeListings}
                isLoading={isListingsLoading}
                emptyMessage="No active listings."
              />
            </section>
          )}

        </div>

        {/* Right Side: wallet and indexed state summary */}
        <div className="tribe-card bg-white p-6 sticky top-24 border border-slate-100 shadow-xl animate-fade-in space-y-6">

          {/* User Profile Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="size-11 rounded-2xl border border-slate-100 font-mono text-xs font-bold text-white shadow-inner"
                style={{ background: stringToGradient(address ?? "blockforge") }}
              >
                <span className="flex size-full items-center justify-center">
                  {addressInitials(address)}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-display font-extrabold text-slate-900">Connected wallet</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-slate-400">
                    {address ? truncateAddress(address, 5) : "—"}
                  </span>
                  <button onClick={handleCopy} className="text-slate-300 hover:text-indigo-600 transition-colors">
                    {copied ? (
                      <span className="text-[8px] font-sans font-bold text-indigo-600 uppercase">Copied</span>
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="size-7 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-3.5" />
            </div>
          </div>

          {/* Balance Block (ETH) */}
          <div className="bg-slate-50 border border-slate-100 p-4.5 rounded-2xl space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-6 bg-indigo-50 border border-indigo-100/50 rounded-full flex items-center justify-center text-[10px]">
                  ETH
                </div>
                <span className="text-[10px] font-display font-extrabold uppercase text-slate-400 tracking-wider">Balance</span>
              </div>
              <span className="text-sm font-display font-extrabold text-slate-950">
                {balance ? parseFloat(balance.formatted).toFixed(3) : "—"} ETH
              </span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="size-6 bg-teal-50 border border-teal-100/50 rounded-full flex items-center justify-center text-[10px]">
                  <DatabaseZap className="size-3 text-teal-600" />
                </div>
                <span className="text-[10px] font-display font-extrabold uppercase text-slate-400 tracking-wider">Indexed NFTs</span>
              </div>
              <span className="text-sm font-display font-extrabold text-teal-600">
                {nfts?.length ?? 0}
              </span>
            </div>
          </div>

          {/* Indexed activity shortcuts */}
          <div className="space-y-2">
            <Link href="/marketplace" className="w-full flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 text-[11px] font-display font-bold text-slate-600 tracking-wide text-left transition-colors shadow-sm">
              <DatabaseZap className="size-3.5 text-indigo-500" />
              <span>Browse indexed listings</span>
              <ChevronRight className="size-3.5 ml-auto text-slate-400" />
            </Link>
            <Link href="/mint" className="w-full flex items-center gap-2.5 px-4 py-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 text-[11px] font-display font-bold text-slate-600 tracking-wide text-left transition-colors shadow-sm">
              <Sparkles className="size-3.5 text-teal-500" />
              <span>Mint through contract</span>
              <ChevronRight className="size-3.5 ml-auto text-slate-400" />
            </Link>
          </div>

          {/* Action Links list */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <Link href={`/profile/${address}`} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-xs font-display font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <span className="flex items-center gap-2">
                <UserRound className="size-3.5 text-indigo-500" />
                My Profile
              </span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </Link>
            <Link href="/docs" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-xs font-display font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Architecture Notes
              </span>
              <ChevronRight className="size-3.5 text-slate-400" />
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-[10px] leading-5 text-slate-400">
              Dashboard reads come from the indexed API. Ownership-changing
              actions still require a wallet transaction against the contracts.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

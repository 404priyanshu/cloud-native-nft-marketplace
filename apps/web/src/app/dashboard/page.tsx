"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserNfts, useUserListings } from "@/hooks/use-api";
import { NftGrid } from "@/components/nft/nft-grid";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import {
  Wallet,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const { data: nfts, isLoading: isNftsLoading } = useUserNfts(
    address?.toLowerCase()
  );
  const { data: listings, isLoading: isListingsLoading } = useUserListings(
    address?.toLowerCase()
  );

  const activeListings = listings?.filter((l) => l.status === "ACTIVE") ?? [];

  if (!isConnected) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-20 max-w-lg mx-auto text-center font-sans bg-[var(--color-space-black)]">
        <div className="cyber-glass p-10 sm:p-14 animate-fade-in border border-[var(--color-cyber-cyan)]/20 shadow-2xl relative overflow-hidden bg-[rgba(10,15,30,0.6)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-indigo)] opacity-[0.03] blur-3xl pointer-events-none" />
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] mb-6 shadow-[0_0_15px_rgba(6,182,212,0.1)] animate-pulse">
            <Wallet className="w-6 h-6 text-[var(--color-cyber-cyan)]" />
          </div>
          <h1 className="text-2xl font-display font-extrabold mb-3 text-white">Sovereign Cockpit</h1>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Please connect your cryptographic Ethereum wallet to inspect owned specimens, manage active listing contracts, and query pending trades.
          </p>
          <div className="flex justify-center shadow-[0_0_15px_rgba(79,70,229,0.15)] rounded-md overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto font-sans bg-[var(--color-space-black)]">
      {/* Header */}
      <div className="mb-10 border-b border-[var(--color-border)] pb-6 relative">
        <div className="absolute -top-10 left-[10%] w-[200px] h-[200px] rounded-full bg-[var(--color-cyber-cyan)] opacity-[0.03] blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-6 h-6 text-[var(--color-cyber-cyan)] animate-pulse" />
          <h1 className="text-3xl font-display font-extrabold text-white">Dashboard</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Manage your minted artifacts and marketplace listings on-chain.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Link
          href="/mint"
          className="cyber-glass p-6 flex items-center gap-4 group transition-all duration-300 border-[var(--color-border)] bg-[rgba(10,15,30,0.5)]"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(6,182,212,0.06)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Sparkles className="w-5 h-5 text-[var(--color-cyber-cyan)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-sm text-white group-hover:text-[var(--color-cyber-cyan)] transition-colors">
              Mint Artifact
            </h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
              Create new digital token
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[var(--color-cyber-cyan)] transition-colors" />
        </Link>

        <Link
          href={`/profile/${address}`}
          className="cyber-glass p-6 flex items-center gap-4 group transition-all duration-300 border-[var(--color-border)] bg-[rgba(10,15,30,0.5)]"
        >
          <div className="w-12 h-12 rounded-xl bg-[rgba(217,70,239,0.06)] border border-[rgba(217,70,239,0.2)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
            <Wallet className="w-5 h-5 text-[var(--color-cyber-magenta)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-sm text-white group-hover:text-[var(--color-cyber-magenta)] transition-colors">
              Public Catalog
            </h3>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
              View your public overview
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[var(--color-cyber-magenta)] transition-colors" />
        </Link>
      </div>

      {/* Stats Row (Glance Grid) */}
      <div className="mb-12">
        <h2 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">
          Ledger Analytics
        </h2>
        <div className="glance-grid">
          <div className="glance-cell border-l-4 border-[var(--color-cyber-cyan)]">
            <div className="glance-label">OWNED SPECIMEN</div>
            <div className="glance-value text-white">{nfts?.length ?? "—"}</div>
            <div className="glance-note">Artifacts in local wallet</div>
          </div>
          <div className="glance-cell border-l-4 border-[var(--color-cyber-magenta)]">
            <div className="glance-label">ACTIVE ESCROW</div>
            <div className="glance-value text-white">{activeListings.length}</div>
            <div className="glance-note">Listings pending trade</div>
          </div>
          <div className="glance-cell border-l-4 border-[var(--color-cyber-indigo)]">
            <div className="glance-label">HISTORICAL TRADES</div>
            <div className="glance-value text-white">{listings?.length ?? "—"}</div>
            <div className="glance-note">Cumulative active / settled</div>
          </div>
        </div>
      </div>

      {/* My NFTs */}
      <section className="mb-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="text-xl font-display font-extrabold mb-5 text-white">Owned Artifacts</h2>
        <NftGrid
          nfts={nfts ?? []}
          isLoading={isNftsLoading}
          emptyMessage="You do not own any artifacts yet. Mint one to get started."
        />
      </section>

      {/* Active Listings */}
      {activeListings.length > 0 && (
        <section className="border-t border-[var(--color-border)] pt-8">
          <h2 className="text-xl font-display font-extrabold mb-5 text-white">Active Listings</h2>
          <ListingGrid
            listings={activeListings}
            isLoading={isListingsLoading}
            emptyMessage="No active listings."
          />
        </section>
      )}
    </div>
  );
}

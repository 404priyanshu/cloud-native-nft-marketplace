"use client";

import { useParams } from "next/navigation";
import { useUserProfile, useUserNfts, useUserListings } from "@/hooks/use-api";
import { NftGrid } from "@/components/nft/nft-grid";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { truncateAddress, formatDate } from "@/lib/utils";
import { useState } from "react";
import { Copy, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "nfts" | "listings";

export default function ProfilePage() {
  const params = useParams();
  const wallet = params.wallet as string;
  const [tab, setTab] = useState<Tab>("nfts");
  const [copied, setCopied] = useState(false);

  const { data: profile } = useUserProfile(wallet);
  const { data: nfts, isLoading: isNftsLoading } = useUserNfts(wallet);
  const { data: listings, isLoading: isListingsLoading } = useUserListings(wallet);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto font-sans bg-[var(--color-space-black)]">
      {/* Profile Header Card */}
      <div className="cyber-glass p-8 mb-10 animate-fade-in bg-[rgba(10,15,30,0.6)] border border-[var(--color-cyber-cyan)]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-indigo)] opacity-[0.03] blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar - Neon glowing container */}
            <div className="w-16 h-16 rounded-2xl bg-[rgba(6,182,212,0.06)] border border-[var(--color-cyber-cyan)]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <User className="w-7 h-7 text-[var(--color-cyber-cyan)]" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-display font-extrabold mb-1 text-white">
                {profile?.displayName || truncateAddress(wallet, 6)}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400 truncate">
                  {wallet}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors text-gray-400 hover:text-[var(--color-cyber-cyan)] shrink-0 border border-transparent"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <span className="text-[9px] font-sans font-bold text-[var(--color-cyber-cyan)] uppercase tracking-wider">Copied</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)]" />
                  Joined {formatDate(profile.createdAt)}
                </div>
              )}
            </div>
          </div>

          {/* Stats Glance (Cyber Design) */}
          <div className="flex gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[var(--color-border)] md:pl-8 shrink-0">
            <div>
              <div className="text-2xl font-display font-black text-[var(--color-cyber-cyan)]">{nfts?.length ?? "—"}</div>
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Specimen Owned</div>
            </div>
            <div>
              <div className="text-2xl font-display font-black text-[var(--color-cyber-magenta)]">{listings?.length ?? "—"}</div>
              <div className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Total Listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-[var(--color-border)] pb-3">
        {(["nfts", "listings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2 rounded text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer",
              tab === t
                ? "bg-[linear-gradient(135deg,var(--color-cyber-indigo),var(--color-cyber-cyan))] border-transparent text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                : "bg-[rgba(255,255,255,0.02)] border-[var(--color-border)] text-gray-400 hover:border-gray-500 hover:text-white"
            )}
          >
            {t === "nfts" ? "Owned Specimen" : "Catalog Listings"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {tab === "nfts" ? (
          <NftGrid
            nfts={nfts ?? []}
            isLoading={isNftsLoading}
            emptyMessage="This wallet does not own any specimens yet."
          />
        ) : (
          <ListingGrid
            listings={listings ?? []}
            isLoading={isListingsLoading}
            emptyMessage="This wallet has not created any escrow listings."
          />
        )}
      </div>
    </div>
  );
}

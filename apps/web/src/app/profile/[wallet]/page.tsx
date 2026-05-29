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
    <div className="px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto font-sans">
      {/* Profile Header Card */}
      <div className="tribe-card p-8 mb-10 animate-fade-in border border-slate-100 shadow-md relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* Avatar - TribeOne styled container */}
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
              <User className="w-7 h-7 text-indigo-500" />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-display font-extrabold mb-1 text-slate-900 tracking-tight">
                {profile?.displayName || truncateAddress(wallet, 6)}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 truncate">
                  {wallet}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md hover:bg-slate-50 transition-colors text-slate-400 hover:text-indigo-600 shrink-0 border border-transparent"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <span className="text-[9px] font-sans font-bold text-indigo-600 uppercase tracking-wider">Copied</span>
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
              {profile?.createdAt && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400 font-mono">
                  <Calendar className="size-3.5 text-indigo-500" />
                  Joined {formatDate(profile.createdAt)}
                </div>
              )}
            </div>
          </div>

          {/* Stats Glance - TribeOne layout */}
          <div className="flex gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8 shrink-0">
            <div>
              <div className="text-2.5xl font-display font-black text-indigo-600">{nfts?.length ?? "—"}</div>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Specimens Owned</div>
            </div>
            <div>
              <div className="text-2.5xl font-display font-black text-rose-500">{listings?.length ?? "—"}</div>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total Listings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Capsule */}
      <div className="flex items-center gap-2 mb-10 border-b border-slate-100 pb-4 animate-fade-in animate-delay-100">
        <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm flex gap-1">
          {([
            { id: "nfts", label: "Owned Specimens" },
            { id: "listings", label: "Escrow Listings" },
          ] as const).map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-5 py-2 text-xs font-display font-semibold rounded-full uppercase tracking-wider transition-all duration-300 cursor-pointer border-none",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in animate-delay-150">
        {tab === "nfts" ? (
          <NftGrid
            nfts={nfts ?? []}
            isLoading={isNftsLoading}
            emptyMessage="This wallet does not own any NFTs yet."
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

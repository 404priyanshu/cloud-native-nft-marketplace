"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowDownUp, Search, SlidersHorizontal } from "lucide-react";
import { useListings } from "@/hooks/use-api";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn, formatEthPrice } from "@/lib/utils";
import type { ListingStatus, MarketplaceListing } from "@/types/api";

const STATUS_OPTIONS: { label: string; value: ListingStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Sold", value: "SOLD" },
  { label: "Cancelled", value: "CANCELLED" },
];

type SortMode = "newest" | "price-low" | "price-high";

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: "Newest", value: "newest" },
  { label: "Low price", value: "price-low" },
  { label: "High price", value: "price-high" },
];

function sumEth(listings: MarketplaceListing[]) {
  return listings.reduce((total, listing) => {
    const value = Number(formatEthPrice(listing.priceWei));
    return Number.isFinite(value) ? total + value : total;
  }, 0);
}

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [statusFilter, setStatusFilter] = useState<ListingStatus | undefined>(
    "ACTIVE"
  );

  const { data: allListings, isLoading: isAllListingsLoading } = useListings();
  const { data: listings, isLoading } = useListings(statusFilter);

  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const base = [...(listings ?? [])];

    const searched = normalizedQuery
      ? base.filter((listing) =>
          [
            listing.tokenId,
            listing.listingId,
            listing.sellerAddress,
            listing.nftContractAddress,
            listing.listedTxHash ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : base;

    return searched.toSorted((a, b) => {
      if (sortMode === "price-low") {
        return BigInt(a.priceWei) < BigInt(b.priceWei) ? -1 : 1;
      }
      if (sortMode === "price-high") {
        return BigInt(a.priceWei) > BigInt(b.priceWei) ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [listings, query, sortMode]);

  const stats = useMemo(() => {
    const all = allListings ?? [];
    const active = all.filter((listing) => listing.status === "ACTIVE");
    const sold = all.filter((listing) => listing.status === "SOLD");

    return [
      {
        label: "Active escrow",
        value: active.length.toString(),
        note: `${sumEth(active).toFixed(3)} ETH currently listed`,
      },
      {
        label: "Settled sales",
        value: sold.length.toString(),
        note: `${sumEth(sold).toFixed(3)} ETH indexed as sold`,
      },
      {
        label: "Total listings",
        value: all.length.toString(),
        note: isAllListingsLoading ? "Reading indexed events" : "Across all statuses",
      },
    ];
  }, [allListings, isAllListingsLoading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-5 border-b border-slate-100 pb-8 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-white">
            Indexed marketplace
          </Badge>
          <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">
            PostgreSQL read model
          </Badge>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl font-display font-extrabold text-slate-950 sm:text-5xl">
            Marketplace Catalog
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            Browse listings indexed from contract events. The interface is fast
            and searchable, while ownership and settlement stay anchored to the
            marketplace contract.
          </p>
        </div>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="tribe-card bg-white p-5">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <Activity className="size-3.5 text-indigo-500" />
              {item.label}
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold text-slate-950">
              {item.value}
            </div>
            <p className="mt-1 text-xs text-slate-500">{item.note}</p>
          </div>
        ))}
      </section>

      <section className="mb-8 rounded-[2rem] border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur-xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search token, seller, contract, or tx hash"
              className="h-11 rounded-full border-slate-100 bg-slate-50 pl-10"
            />
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1">
            <SlidersHorizontal className="ml-2 size-4 text-indigo-500" />
            <ToggleGroup
              type="single"
              value={statusFilter ?? "ALL"}
              onValueChange={(value) => {
                if (!value) return;
                setStatusFilter(
                  value === "ALL" ? undefined : (value as ListingStatus)
                );
              }}
              className="flex gap-1"
            >
              {STATUS_OPTIONS.map((option) => {
                const active = (statusFilter ?? "ALL") === option.value;
                return (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "rounded-full border-none px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider transition-all data-[state=on]:!bg-slate-950 data-[state=on]:!text-white",
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-500 hover:bg-white hover:text-slate-950"
                    )}
                  >
                    {option.label}
                  </ToggleGroupItem>
                );
              })}
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-50 p-1">
            <ArrowDownUp className="ml-2 size-4 text-indigo-500" />
            <ToggleGroup
              type="single"
              value={sortMode}
              onValueChange={(value) => {
                if (value) setSortMode(value as SortMode);
              }}
              className="flex gap-1"
            >
              {SORT_OPTIONS.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="rounded-full border-none px-3 py-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-slate-500 transition-all data-[state=on]:!bg-white data-[state=on]:!text-slate-950 data-[state=on]:shadow-sm"
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </section>

      <div className="animate-fade-in">
        <ListingGrid
          listings={visibleListings}
          isLoading={isLoading}
          emptyMessage={
            query
              ? "No indexed listings match that search."
              : statusFilter
              ? `No ${statusFilter.toLowerCase()} listings are indexed yet.`
              : "No listings are indexed yet."
          }
        />
      </div>
    </div>
  );
}

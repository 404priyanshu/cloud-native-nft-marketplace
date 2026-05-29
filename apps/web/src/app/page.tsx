"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cloud,
  DatabaseZap,
  FileCheck2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useListings } from "@/hooks/use-api";
import { ListingGrid } from "@/components/marketplace/listing-grid";
import { formatEthPrice } from "@/lib/utils";

const proofPoints = [
  {
    label: "Settlement",
    value: "Escrow ERC-721",
    note: "Listing, sale, cancellation, and fee split live in Solidity.",
  },
  {
    label: "Read Model",
    value: "Event Indexed",
    note: "PostgreSQL is rebuilt from emitted chain events for fast UX.",
  },
  {
    label: "Operations",
    value: "ECS Ready",
    note: "API and worker are packaged for Fargate with Redis and RDS.",
  },
];

const architecture = [
  {
    icon: WalletCards,
    title: "Wallet writes",
    description:
      "Mint, list, buy, and cancel actions are signed by the user and sent directly to the contracts.",
  },
  {
    icon: DatabaseZap,
    title: "Indexed reads",
    description:
      "The worker processes NFTMinted, NFTListed, NFTSold, and ListingCancelled into queryable tables.",
  },
  {
    icon: Cloud,
    title: "Cloud runtime",
    description:
      "NestJS, Prisma, Redis, Docker, GitHub Actions, and Terraform form the deployment backbone.",
  },
];

export default function HomePage() {
  const { data: listings, isLoading } = useListings("ACTIVE");
  const featuredListing = listings?.[0];
  const featuredImage =
    featuredListing?.nft?.imageUrl ?? "/images/hero_holo_nft.png";
  const featuredName =
    featuredListing?.nft?.name ??
    (featuredListing
      ? `Token #${featuredListing.tokenId}`
      : "Marketplace system preview");
  const featuredSource = featuredListing ? "Indexed listing" : "Visual preview";
  const featuredStatus = featuredListing?.status ?? "Awaiting listings";
  const featuredDetail = featuredListing
    ? `${formatEthPrice(featuredListing.priceWei)} ETH`
    : "No indexed active listing selected";

  return (
    <div className="relative overflow-hidden pt-6">
      {/* 1. Hero Block */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-16">
        <div className="flex flex-col gap-8 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="bg-white border-slate-100 text-slate-700 font-display font-semibold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full shadow-sm">
              Contract-settled marketplace
            </Badge>
            <Badge className="bg-indigo-50 border-none text-indigo-600 font-display font-semibold uppercase tracking-wider text-[10px] px-3 py-1 rounded-full shadow-sm hover:bg-indigo-100">
              Indexer-backed API
            </Badge>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-5xl font-display font-extrabold leading-[1.08] text-slate-900 tracking-tight sm:text-6xl lg:text-7xl">
              Sovereign Asset <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 via-indigo-500 to-indigo-600">
                Marketplace
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-md leading-relaxed text-slate-500">
              A premium, high-speed digital asset terminal. Solidity contracts handle on-chain trust
              and escrow settlement, while a cloud-native worker indexes real-time blockchain logs.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 sm:flex-row">
            <Link href="/marketplace" className="btn-primary">
              Explore Marketplace
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/mint" className="btn-secondary">
              Mint Artifact
            </Link>
          </div>

          <div className="glance-grid mt-4">
            {proofPoints.map((item) => (
              <div key={item.label} className="glance-cell">
                <div className="glance-label">{item.label}</div>
                <div className="glance-value text-slate-950 font-display">{item.value}</div>
                <div className="glance-note text-slate-400">{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Specimen Frame - TribeOne Card style */}
          <div className="tribe-card p-5 max-w-[460px] w-full bg-white tilt-card">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Specimen preview</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {featuredListing ? `Listing ${featuredListing.listingId}` : "Local visual"}
              </span>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-100 mb-5">
              <Image
                src={featuredImage}
                alt={featuredName}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 420px"
                priority
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <h3 className="text-md font-display font-extrabold text-slate-900">{featuredName}</h3>
                <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{featuredSource}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">{featuredDetail}</p>
                <p className="mt-0.5 font-display font-semibold text-emerald-600 text-xs bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">{featuredStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Marketplace Preview */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 border-t border-slate-100/60 pt-16">
        <div className="mb-8 flex flex-col gap-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Marketplace preview</span>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-3xl font-display font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center gap-2">
              Active contract listings
            </h2>

            <Link href="/marketplace" className="btn-secondary">
              View full catalog
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <ListingGrid
          listings={listings ?? []}
          isLoading={isLoading}
          emptyMessage="No catalog items indexed yet."
        />
      </section>

      {/* 3. Tech Architecture Section */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Separator className="bg-slate-200/60 mb-16" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {architecture.map((item) => (
            <div
              key={item.title}
              className="tribe-card p-8 bg-white flex flex-col gap-4 transition-all duration-300"
            >
              <div className="size-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                <item.icon className="size-5" />
              </div>
              <h3 className="text-lg font-display font-extrabold text-slate-900 mt-2">{item.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Banner CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="tribe-card bg-gradient-to-br from-slate-900 to-slate-950 text-white p-10 md:p-14 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 size-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 size-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center relative z-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="size-4" />
                Backend never holds private keys
              </div>
              <h2 className="text-3xl font-display font-extrabold leading-tight text-white sm:text-4xl">
                The marketplace is the domain. <br />
                The system design is the proof.
              </h2>
              <p className="max-w-2xl text-slate-300 text-xs leading-relaxed">
                Browse listed assets instantly through the high-performance PostgreSQL read model,
                then execute secure ownership changes via your hardware or web wallet.
              </p>
            </div>
            <div>
              <Link href="/dashboard" className="btn-secondary bg-white text-slate-900 hover:bg-slate-50 border-none font-bold shadow-lg h-11 px-6 rounded-full flex items-center gap-1.5 transition-all">
                Go to Dashboard
                <FileCheck2 className="size-4 text-indigo-500" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

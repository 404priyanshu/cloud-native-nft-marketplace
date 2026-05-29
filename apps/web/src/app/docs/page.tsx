import {
  Cloud,
  DatabaseZap,
  FileCheck2,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const flows = [
  {
    icon: WalletCards,
    title: "Wallet-signed writes",
    body: "Mint, list, buy, and cancel actions are sent through the user's wallet. The frontend does not ask the API to mutate ownership.",
  },
  {
    icon: FileCheck2,
    title: "Contract truth",
    body: "The marketplace contract emits NFTMinted, NFTListed, NFTSold, and ListingCancelled events for settlement and status changes.",
  },
  {
    icon: DatabaseZap,
    title: "Indexed read model",
    body: "The worker reads public chain logs and writes idempotent PostgreSQL rows for fast NFT, listing, profile, and transaction screens.",
  },
  {
    icon: Cloud,
    title: "Cloud runtime",
    body: "The API and worker are packaged for Docker and AWS ECS, with PostgreSQL, Redis, object storage, logs, and Terraform as the deployment foundation.",
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 max-w-3xl animate-fade-in">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-white">
            Architecture notes
          </Badge>
          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
            Backend never holds private keys
          </Badge>
        </div>
        <h1 className="text-4xl font-display font-extrabold text-slate-950 sm:text-5xl">
          Trust on-chain. Read fast off-chain.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          BlockForge Market uses the NFT marketplace domain to demonstrate a
          production-style split: Solidity owns settlement and ownership, while
          cloud services own indexing, search, API ergonomics, and deployment.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {flows.map((item) => (
          <article key={item.title} className="tribe-card bg-white p-6">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-indigo-600">
              <item.icon className="size-5" />
            </div>
            <h2 className="text-lg font-display font-extrabold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.body}</p>
          </article>
        ))}
      </section>

      <Separator className="my-10 bg-slate-200/70" />

      <section className="tribe-card bg-slate-950 p-7 text-white">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <ShieldCheck className="size-4" />
              Security posture
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              The API is a read and coordination layer.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            API data is useful for browsing, filtering, and profiles, but the
            contract remains canonical for ownership and listing state. The
            worker only reads public chain data, and deployment keys stay out of
            the API and worker runtime.
          </p>
        </div>
      </section>
    </div>
  );
}

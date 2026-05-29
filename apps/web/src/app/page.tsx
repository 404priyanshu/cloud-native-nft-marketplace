import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative w-full max-w-full overflow-hidden font-sans bg-[var(--color-space-black)] min-h-screen">
      {/* Backlit Cyber Glows (Mouse/Static background highlights) */}
      <div className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-[var(--color-cyber-cyan)] opacity-[0.08] blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute top-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-[var(--color-cyber-magenta)] opacity-[0.08] blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />

      {/* Retro-Futuristic 3D Perspective Grid */}
      <div className="perspective-grid" />

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-20 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Composed Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-left animate-fade-in">
            {/* Luminous Cyber Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(6,182,212,0.06)] border border-[var(--color-cyber-cyan)]/30 text-[10px] font-mono font-bold text-[var(--color-cyber-cyan-hover)] uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
              <Zap className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)]" />
              Decentralized Ledger Provenance
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-white">
              Discover, Mint & <br />
              <span className="glow-text-grad">Trade Cyber Artifacts</span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed pt-2">
              A high-fidelity cloud-native NFT marketplace built with Solidity smart contracts, 
              event-driven ledger indexing, and spatial glassmorphism. Acquire and manage specimen 
              on an immutable on-chain registry.
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-4">
              <Link href="/marketplace" className="btn-primary text-xs tracking-wider px-6 py-3 font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                Explore Catalog
                <ArrowRight className="w-4 h-4 text-[var(--color-cyber-cyan)]" />
              </Link>
              <Link href="/mint" className="btn-secondary text-xs tracking-wider px-6 py-3 font-bold border-[rgba(255,255,255,0.08)]">
                Mint Specimen
              </Link>
            </div>
          </div>

          {/* Right Column: Floating 3D Holographic Specimen Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative group w-full max-w-[380px]">
              {/* Backlit Luminous Halo */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-cyber-cyan)] to-[var(--color-cyber-magenta)] opacity-25 blur-3xl group-hover:opacity-40 transition-opacity pointer-events-none" />

              {/* Matting Glass Container */}
              <div className="cyber-glass p-5 relative overflow-hidden shadow-2xl border border-[var(--color-cyber-cyan)]/30 animate-float bg-[rgba(10,15,30,0.6)]">
                {/* Visual Framed Image wrapper */}
                <div className="w-full aspect-square relative rounded-lg overflow-hidden bg-[var(--color-space-black)] border border-white/5 shadow-inner">
                  <Image
                    src="/images/hero_holo_nft.png"
                    alt="CyberHolo Rotating Specimen core"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 380px"
                    priority
                  />
                </div>

                {/* Cyber Card Branding labels */}
                <div className="pt-4 flex items-center justify-between font-mono">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest block">AUTHENTIC ENTITY</span>
                    <span className="text-xs font-bold text-white tracking-wide">CRYSTAL_CORE_N01</span>
                  </div>
                  <span className="badge badge-active text-[10px]">
                    ACTIVE ESCROW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row (Glance Grid Style) */}
        <div 
          className="mt-20 max-w-7xl mx-auto animate-fade-in" 
          style={{ animationDelay: "0.3s" }}
        >
          <div className="glance-grid">
            <div className="glance-cell border-l-4 border-[var(--color-cyber-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <div className="glance-label">LEDGER SPEC</div>
              <div className="glance-value text-white">ERC-721</div>
              <div className="glance-note">Sovereign smart contracts</div>
            </div>
            <div className="glance-cell border-l-4 border-[var(--color-cyber-magenta)] shadow-[0_0_15px_rgba(217,70,239,0.05)]">
              <div className="glance-label">CLEARING ESCROW</div>
              <div className="glance-value text-white">2.5%</div>
              <div className="glance-note">Low-friction split clearing</div>
            </div>
            <div className="glance-cell border-l-4 border-[var(--color-cyber-indigo)] shadow-[0_0_15px_rgba(79,70,229,0.05)]">
              <div className="glance-label">EVENT INDEXER</div>
              <div className="glance-value text-white">ON-CHAIN</div>
              <div className="glance-note">Idempotent database indexing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto z-10">
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-center mb-12 text-white">
          Decentralized Trading <span className="glow-text-grad">Topology</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            step="I"
            title="Artifact Creation"
            description="Securely upload metadata payloads and mint unique ERC-721 tokens to the blockchain ledger. Gain absolute, cryptographic provenance."
          />
          <FeatureCard
            step="II"
            title="Sovereign Escrow"
            description="Approve and deposit specimens into the decentralized marketplace contract. Relinquish custody only when buyer terms clear."
          />
          <FeatureCard
            step="III"
            title="Symmetric Clearance"
            description="Acquire artifacts instantly via transparent smart-contract settlements. Royalties and split gallery fees execute atomically."
          />
        </div>
      </section>

      {/* Architectural Highlight */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 max-w-4xl mx-auto z-10 pb-20">
        <div className="cyber-glass-glow p-8 sm:p-12 text-center border border-[var(--color-cyber-cyan)]/20 bg-[rgba(10,14,26,0.65)]">
          <h2 className="text-xl sm:text-2xl font-display font-black mb-4 text-white leading-tight">
            A Composed System Built for <span className="text-[var(--color-cyber-cyan)] font-bold">Production</span>
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-2xl mx-auto leading-relaxed">
            This repository is an implementation of a complete cloud-native architecture. 
            Ethereum smart contracts establish absolute provenance, a read-optimized event indexer 
            guarantees idempotency in PostgreSQL, and an elegant NestJS REST API serves data to this 
            composed print-ready Next.js client.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap text-[9px] font-mono font-bold tracking-widest uppercase text-gray-400">
            {[
              "Solidity",
              "Hardhat",
              "NestJS",
              "Prisma",
              "PostgreSQL",
              "Redis",
              "Next.js",
              "wagmi",
              "Docker",
              "Terraform",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded bg-[rgba(255,255,255,0.015)] border border-white/5 shadow-inner"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="cyber-glass p-8 flex flex-col justify-between group transition-all duration-300">
      <div>
        <div className="text-xs font-mono font-bold text-[var(--color-cyber-cyan)] mb-3 tracking-widest">
          {step}
        </div>
        <h3 className="text-base font-display font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

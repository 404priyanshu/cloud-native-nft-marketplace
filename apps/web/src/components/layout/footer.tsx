import { Hexagon, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[rgba(7,10,19,0.4)] mt-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[rgba(6,182,212,0.1)] border border-[var(--color-cyber-cyan)]/30 flex items-center justify-center">
              <Hexagon className="w-3.5 h-3.5 text-[var(--color-cyber-cyan)]" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-display font-bold text-white tracking-tight">
              Block<span className="text-[var(--color-cyber-cyan)] font-bold">Forge</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs uppercase tracking-wider font-bold text-gray-400 font-display">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[var(--color-cyber-cyan)] transition-colors"
            >
              <Github className="w-4 h-4 text-[var(--color-cyber-indigo)]" />
              GitHub
            </Link>
            <Link
              href="/docs"
              className="hover:text-[var(--color-cyber-cyan)] transition-colors"
            >
              Docs
            </Link>
          </div>

          {/* Tagline */}
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Symmetric Ledger Exchange · Built with Solidity
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Menu, X, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/mint", label: "Mint Artifact" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[rgba(2,4,10,0.7)] backdrop-blur-md border-b border-[rgba(6,182,212,0.15)] shadow-md shadow-[rgba(6,182,212,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[rgba(6,182,212,0.1)] border border-[var(--color-cyber-cyan)]/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:border-[var(--color-cyber-cyan)] shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Hexagon className="w-4.5 h-4.5 text-[var(--color-cyber-cyan)]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-display font-bold tracking-tight text-white">
            Block<span className="glow-text-grad font-bold">Forge</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2 font-display text-xs uppercase tracking-wider font-bold">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-1.5 rounded-md transition-all duration-250 border",
                  isActive
                    ? "text-[var(--color-cyber-cyan)] bg-[rgba(6,182,212,0.06)] border-[rgba(6,182,212,0.25)] shadow-[0_0_15px_rgba(6,182,212,0.05)]"
                    : "text-gray-400 border-transparent hover:text-white hover:bg-[rgba(255,255,255,0.03)] hover:border-[var(--color-border)]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Wallet + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <div className="shadow-[0_0_15px_rgba(79,70,229,0.15)] rounded-md overflow-hidden">
            <ConnectButton
              chainStatus="icon"
              accountStatus="address"
              showBalance={false}
            />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors border border-transparent"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-space-black)] border-b border-[var(--color-border)] animate-fade-in font-display text-xs uppercase tracking-wider font-bold shadow-lg">
          <div className="px-4 py-4 space-y-1.5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-md transition-colors border",
                    isActive
                      ? "text-[var(--color-cyber-cyan)] bg-[rgba(6,182,212,0.06)] border-[rgba(6,182,212,0.25)]"
                      : "text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

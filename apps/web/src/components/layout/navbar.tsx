"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { Menu, X, Hexagon, ArrowUpRight, Plus, DatabaseZap } from "lucide-react";
import { addressInitials, cn, stringToGradient } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/mint", label: "Mint" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 h-18 bg-white/95 border-b border-slate-100 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* Left Side: Logo & Main Nav Links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-8.5 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/20">
              <Hexagon className="text-primary size-4.5" strokeWidth={2.3} />
            </div>
            <span className="text-lg font-display font-extrabold tracking-tight text-slate-900">
              Block<span className="text-primary">Forge</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-xs font-display font-bold text-slate-500 uppercase tracking-wider">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 transition-colors",
                    isActive
                      ? "bg-slate-950 text-white"
                      : "hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden md:flex flex-1 justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3.5 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            <DatabaseZap className="size-3.5 text-indigo-500" />
            Indexed reads, wallet writes
          </div>
        </div>

        {/* Right Side: Wallet & Mobile Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/mint" className="hidden sm:inline-flex btn-secondary h-10 px-4.5 py-0 text-xs tracking-wider uppercase font-bold items-center gap-1.5 rounded-full">
            <Plus className="size-3.5" />
            Create
          </Link>

          <div className="rounded-full overflow-hidden">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="wallet-sign-in"
                          >
                            Sign In
                          </button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            type="button"
                            className="bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm"
                          >
                            Wrong Network
                          </button>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={openAccountModal}
                            type="button"
                            className="user-avatar-pill hover:bg-slate-50 transition-colors"
                          >
                            <div
                              className="size-6.5 rounded-full border border-slate-200 font-mono text-[9px] font-bold text-white"
                              style={{ background: stringToGradient(account.address) }}
                            >
                              <span className="flex size-full items-center justify-center">
                                {addressInitials(account.address)}
                              </span>
                            </div>
                            <span className="text-slate-800 text-xs font-bold font-display">
                              {account.displayName}
                            </span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden rounded-full border border-slate-100 bg-white p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-800 shadow-sm"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute top-18 left-4 right-4 z-40 lg:hidden bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="flex flex-col gap-2 p-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Button
                  key={link.href}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={cn("w-full justify-start rounded-xl font-display font-semibold uppercase tracking-wider text-xs",
                    isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Link href={link.href} onClick={() => setMobileOpen(false)}>
                    {link.label}
                    <ArrowUpRight className="ml-auto size-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

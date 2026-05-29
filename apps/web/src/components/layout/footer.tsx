import { Hexagon } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-white/20 backdrop-blur-md relative z-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Hexagon className="text-primary size-4.5" strokeWidth={2.3} />
            </div>
            <span className="text-sm font-display font-extrabold tracking-tight text-foreground">
              Block<span className="text-primary">Forge</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Link
              href="/docs"
              className="transition-colors hover:text-foreground"
            >
              Docs
            </Link>
          </div>

          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Contract truth. Indexed reads. Cloud runtime.
          </p>
        </div>
      </div>
    </footer>
  );
}

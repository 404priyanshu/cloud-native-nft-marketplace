import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "BlockForge Market — Cloud-Native NFT Exchange",
  description:
    "A production-style NFT marketplace where Solidity contracts settle ownership and a cloud-native indexer serves the read model.",
  keywords: ["NFT", "marketplace", "blockchain", "ethereum", "solidity", "web3"],
  authors: [{ name: "BlockForge" }],
  openGraph: {
    title: "BlockForge Market",
    description: "A cloud-native marketplace with on-chain settlement and indexed reads.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh w-full flex flex-col bg-background text-foreground antialiased relative">
        <Providers>
          <Navbar />
          <main className="w-full max-w-full flex-1 pt-24 pb-16 relative z-10">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

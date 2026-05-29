import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BlockForge — Cyber NFT Marketplace",
  description:
    "A cloud-native dynamic NFT marketplace. Mint, list, buy, and trade unique cyber artifacts with on-chain transparency.",
  keywords: ["NFT", "marketplace", "blockchain", "ethereum", "solidity", "web3"],
  authors: [{ name: "BlockForge" }],
  openGraph: {
    title: "BlockForge — NFT Marketplace",
    description: "Mint, list, buy, and trade unique cyber artifacts.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body className="min-h-dvh w-full flex flex-col bg-[var(--color-space-black)] text-[#f3f4f6] font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="w-full max-w-full flex-1 pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatEther } from "viem";

/** Merge Tailwind classes with clsx */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Truncate an address to 0x1234…5678 format */
export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Format a wei string to ETH with up to 4 decimal places */
export function formatEthPrice(weiString: string): string {
  try {
    const eth = formatEther(BigInt(weiString));
    const num = parseFloat(eth);
    // Remove trailing zeros
    return num % 1 === 0 ? num.toString() : num.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  } catch {
    return "0";
  }
}

/** Format an ISO date string to a human-readable format */
export function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

/** Get block explorer URL for a transaction */
export function getExplorerUrl(txHash: string, chainId: number): string {
  switch (chainId) {
    case 1:
      return `https://etherscan.io/tx/${txHash}`;
    case 11155111:
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    case 31337:
      return `#`; // localhost has no explorer
    default:
      return `#`;
  }
}

/** Generate a deterministic gradient from a string (e.g. token ID or address) */
export function stringToGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 70%, 40%), hsl(${h2}, 80%, 55%))`;
}

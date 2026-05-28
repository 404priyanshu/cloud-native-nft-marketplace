import type { Abi } from "viem";

import blockForgeMarketplaceAbi from "@blockforge/contracts/abis/BlockForgeMarketplace.json" with { type: "json" };
import blockForgeNFTAbi from "@blockforge/contracts/abis/BlockForgeNFT.json" with { type: "json" };

export const blockForgeMarketplaceAbiTyped =
  blockForgeMarketplaceAbi as Abi;
export const blockForgeNFTAbiTyped = blockForgeNFTAbi as Abi;

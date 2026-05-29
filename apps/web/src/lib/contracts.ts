import BlockForgeNFTAbi from "../../../../packages/contracts/exports/abis/BlockForgeNFT.json";
import BlockForgeMarketplaceAbi from "../../../../packages/contracts/exports/abis/BlockForgeMarketplace.json";
import type { Abi, Address } from "viem";

/* ─── ABIs ─── */
export const nftAbi = BlockForgeNFTAbi as Abi;
export const marketplaceAbi = BlockForgeMarketplaceAbi as Abi;

/* ─── Contract Addresses ─── */
export const NFT_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address;

export const MARKETPLACE_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000") as Address;

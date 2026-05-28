import type { Address } from "viem";

export const listingStatuses = ["ACTIVE", "SOLD", "CANCELLED"] as const;

export type ListingStatus = (typeof listingStatuses)[number];

export type ContractAddresses = {
  nft: Address;
  marketplace: Address;
};

export type NetworkConfig = {
  chainId: number;
  name: string;
  rpcUrl: string;
  contracts: ContractAddresses;
  startBlock: bigint;
};

export const placeholderAddress =
  "0x0000000000000000000000000000000000000000" as Address;

function parseOptionalAddress(value: string | undefined): Address {
  return (value ?? placeholderAddress) as Address;
}

function parseBigIntEnv(value: string | undefined, fallback: bigint): bigint {
  if (!value) {
    return fallback;
  }

  return BigInt(value);
}

export function getIndexerNetworkConfig(env = process.env): NetworkConfig {
  return {
    chainId: Number(env.CHAIN_ID ?? 31337),
    name: env.NETWORK_NAME ?? "local",
    rpcUrl: env.RPC_URL ?? "http://127.0.0.1:8545",
    contracts: {
      nft: parseOptionalAddress(env.NFT_CONTRACT_ADDRESS),
      marketplace: parseOptionalAddress(env.MARKETPLACE_CONTRACT_ADDRESS),
    },
    startBlock: parseBigIntEnv(env.INDEXER_START_BLOCK, 0n),
  };
}

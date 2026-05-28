import {
  blockForgeMarketplaceAbiTyped,
  blockForgeNFTAbiTyped,
  type NetworkConfig,
} from "@blockforge/shared";
import {
  createPublicClient,
  http,
  type Address,
  type PublicClient,
} from "viem";

import type { IndexedEvent } from "./events.js";

type RawContractEvent = {
  address: Address;
  args: Record<string, unknown>;
  blockNumber: bigint;
  logIndex: number;
  transactionHash: `0x${string}`;
};

export function createChainClient(config: NetworkConfig): PublicClient {
  return createPublicClient({
    transport: http(config.rpcUrl),
  });
}

async function blockTimestamp(
  publicClient: PublicClient,
  cache: Map<string, Date>,
  blockNumber: bigint,
): Promise<Date> {
  const key = blockNumber.toString();
  const cached = cache.get(key);

  if (cached) {
    return cached;
  }

  const block = await publicClient.getBlock({ blockNumber });
  const timestamp = new Date(Number(block.timestamp) * 1000);

  cache.set(key, timestamp);

  return timestamp;
}

function requireArg<T>(args: Record<string, unknown>, key: string): T {
  const value = args[key];

  if (value === undefined || value === null) {
    throw new Error(`Missing event argument: ${key}`);
  }

  return value as T;
}

export async function fetchIndexedEvents(
  publicClient: PublicClient,
  config: NetworkConfig,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<IndexedEvent[]> {
  const timestampCache = new Map<string, Date>();
  const [mintedLogs, listedLogs, soldLogs, cancelledLogs] = await Promise.all([
    publicClient.getContractEvents({
      abi: blockForgeNFTAbiTyped,
      address: config.contracts.nft,
      eventName: "NFTMinted",
      fromBlock,
      strict: true,
      toBlock,
    }),
    publicClient.getContractEvents({
      abi: blockForgeMarketplaceAbiTyped,
      address: config.contracts.marketplace,
      eventName: "NFTListed",
      fromBlock,
      strict: true,
      toBlock,
    }),
    publicClient.getContractEvents({
      abi: blockForgeMarketplaceAbiTyped,
      address: config.contracts.marketplace,
      eventName: "NFTSold",
      fromBlock,
      strict: true,
      toBlock,
    }),
    publicClient.getContractEvents({
      abi: blockForgeMarketplaceAbiTyped,
      address: config.contracts.marketplace,
      eventName: "ListingCancelled",
      fromBlock,
      strict: true,
      toBlock,
    }),
  ]);

  const events: IndexedEvent[] = [];

  for (const log of mintedLogs as RawContractEvent[]) {
    events.push({
      args: {
        owner: requireArg<Address>(log.args, "owner"),
        tokenId: requireArg<bigint>(log.args, "tokenId"),
        tokenURI: requireArg<string>(log.args, "tokenURI"),
      },
      blockNumber: log.blockNumber,
      blockTimestamp: await blockTimestamp(
        publicClient,
        timestampCache,
        log.blockNumber,
      ),
      contractAddress: log.address,
      logIndex: log.logIndex,
      name: "NFTMinted",
      txHash: log.transactionHash,
    });
  }

  for (const log of listedLogs as RawContractEvent[]) {
    events.push({
      args: {
        listingId: requireArg<bigint>(log.args, "listingId"),
        nftContract: requireArg<Address>(log.args, "nftContract"),
        price: requireArg<bigint>(log.args, "price"),
        seller: requireArg<Address>(log.args, "seller"),
        tokenId: requireArg<bigint>(log.args, "tokenId"),
      },
      blockNumber: log.blockNumber,
      blockTimestamp: await blockTimestamp(
        publicClient,
        timestampCache,
        log.blockNumber,
      ),
      contractAddress: log.address,
      logIndex: log.logIndex,
      name: "NFTListed",
      txHash: log.transactionHash,
    });
  }

  for (const log of soldLogs as RawContractEvent[]) {
    events.push({
      args: {
        buyer: requireArg<Address>(log.args, "buyer"),
        listingId: requireArg<bigint>(log.args, "listingId"),
        nftContract: requireArg<Address>(log.args, "nftContract"),
        price: requireArg<bigint>(log.args, "price"),
        seller: requireArg<Address>(log.args, "seller"),
        tokenId: requireArg<bigint>(log.args, "tokenId"),
      },
      blockNumber: log.blockNumber,
      blockTimestamp: await blockTimestamp(
        publicClient,
        timestampCache,
        log.blockNumber,
      ),
      contractAddress: log.address,
      logIndex: log.logIndex,
      name: "NFTSold",
      txHash: log.transactionHash,
    });
  }

  for (const log of cancelledLogs as RawContractEvent[]) {
    events.push({
      args: {
        listingId: requireArg<bigint>(log.args, "listingId"),
        nftContract: requireArg<Address>(log.args, "nftContract"),
        seller: requireArg<Address>(log.args, "seller"),
        tokenId: requireArg<bigint>(log.args, "tokenId"),
      },
      blockNumber: log.blockNumber,
      blockTimestamp: await blockTimestamp(
        publicClient,
        timestampCache,
        log.blockNumber,
      ),
      contractAddress: log.address,
      logIndex: log.logIndex,
      name: "ListingCancelled",
      txHash: log.transactionHash,
    });
  }

  return events.sort((left, right) => {
    if (left.blockNumber === right.blockNumber) {
      return left.logIndex - right.logIndex;
    }

    return left.blockNumber < right.blockNumber ? -1 : 1;
  });
}

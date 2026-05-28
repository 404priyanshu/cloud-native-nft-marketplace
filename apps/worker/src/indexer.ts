import type { PrismaClient } from "@blockforge/database";
import type { NetworkConfig } from "@blockforge/shared";
import type { Address, PublicClient } from "viem";

import { applyIndexedEvent } from "./events.js";
import { fetchIndexedEvents } from "./chain.js";

export type IndexerOptions = {
  blockRange: bigint;
  network: NetworkConfig;
};

function normalizeAddress(address: Address): string {
  return address.toLowerCase();
}

async function getNextFromBlock(
  prisma: PrismaClient,
  network: NetworkConfig,
): Promise<bigint> {
  const cursor = await prisma.indexerCursor.findUnique({
    where: {
      chainId_contractAddress: {
        chainId: network.chainId,
        contractAddress: normalizeAddress(network.contracts.marketplace),
      },
    },
  });

  if (!cursor) {
    return network.startBlock;
  }

  return cursor.lastBlockNumber + 1n;
}

async function saveCursor(
  prisma: PrismaClient,
  network: NetworkConfig,
  lastBlockNumber: bigint,
) {
  await prisma.indexerCursor.upsert({
    create: {
      chainId: network.chainId,
      contractAddress: normalizeAddress(network.contracts.marketplace),
      lastBlockNumber,
    },
    update: {
      lastBlockNumber,
    },
    where: {
      chainId_contractAddress: {
        chainId: network.chainId,
        contractAddress: normalizeAddress(network.contracts.marketplace),
      },
    },
  });
}

export async function indexOnce(
  prisma: PrismaClient,
  publicClient: PublicClient,
  options: IndexerOptions,
) {
  const latestBlock = await publicClient.getBlockNumber();
  let fromBlock = await getNextFromBlock(prisma, options.network);

  if (fromBlock > latestBlock) {
    return { eventsProcessed: 0, fromBlock, latestBlock };
  }

  let eventsProcessed = 0;

  while (fromBlock <= latestBlock) {
    const toBlock =
      fromBlock + options.blockRange - 1n > latestBlock
        ? latestBlock
        : fromBlock + options.blockRange - 1n;

    const events = await fetchIndexedEvents(
      publicClient,
      options.network,
      fromBlock,
      toBlock,
    );

    for (const event of events) {
      await applyIndexedEvent(prisma, {
        chainId: options.network.chainId,
        marketplaceAddress: options.network.contracts.marketplace,
      }, event);
      eventsProcessed++;
    }

    await saveCursor(prisma, options.network, toBlock);
    fromBlock = toBlock + 1n;
  }

  return { eventsProcessed, fromBlock, latestBlock };
}

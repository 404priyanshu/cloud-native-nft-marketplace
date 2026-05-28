import "dotenv/config";

import { prisma } from "@blockforge/database";
import { Redis } from "ioredis";

import { createChainClient } from "./chain.js";
import { loadWorkerConfig } from "./config.js";
import { indexOnce } from "./indexer.js";
import { acquireLock, releaseLock } from "./lock.js";

const config = loadWorkerConfig();
const redis = new Redis(config.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});
const publicClient = createChainClient(config.network);

let shuttingDown = false;

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCycle() {
  const lockKey = `blockforge:indexer:${config.network.chainId}:${config.network.contracts.marketplace.toLowerCase()}`;
  const lock = await acquireLock(redis, lockKey, config.lockTtlMs);

  if (!lock) {
    console.log("Indexer lock is held by another worker; skipping cycle.");
    return;
  }

  try {
    const result = await indexOnce(prisma, publicClient, {
      blockRange: config.blockRange,
      network: config.network,
    });

    console.log(
      `Indexed ${result.eventsProcessed} events through block ${result.latestBlock.toString()}.`,
    );
  } finally {
    await releaseLock(redis, lock);
  }
}

async function shutdown() {
  shuttingDown = true;
  await redis.quit();
  await prisma.$disconnect();
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});

await redis.connect();

do {
  await runCycle();

  if (!config.runOnce) {
    await sleep(config.pollIntervalMs);
  }
} while (!config.runOnce && !shuttingDown);

await shutdown();

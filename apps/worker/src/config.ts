import { getIndexerNetworkConfig, placeholderAddress } from "@blockforge/shared";

export type WorkerConfig = ReturnType<typeof loadWorkerConfig>;

function parseNumberEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid non-negative number: ${value}`);
  }

  return parsed;
}

export function loadWorkerConfig(env = process.env) {
  const network = getIndexerNetworkConfig(env);

  if (
    network.contracts.nft === placeholderAddress ||
    network.contracts.marketplace === placeholderAddress
  ) {
    throw new Error(
      "NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS must be set before running the indexer",
    );
  }

  return {
    network,
    redisUrl: env.REDIS_URL ?? "redis://localhost:6379",
    blockRange: BigInt(parseNumberEnv(env.INDEXER_BLOCK_RANGE, 1000)),
    pollIntervalMs: parseNumberEnv(env.INDEXER_POLL_INTERVAL_MS, 5000),
    lockTtlMs: parseNumberEnv(env.INDEXER_LOCK_TTL_MS, 30_000),
    runOnce: env.INDEXER_RUN_ONCE === "true",
  };
}

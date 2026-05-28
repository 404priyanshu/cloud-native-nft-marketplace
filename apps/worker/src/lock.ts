import type { Redis } from "ioredis";

export type LockHandle = {
  key: string;
  value: string;
};

export async function acquireLock(
  redis: Redis,
  key: string,
  ttlMs: number,
): Promise<LockHandle | null> {
  const value = `${process.pid}:${Date.now()}:${Math.random()}`;
  const result = await redis.set(key, value, "PX", ttlMs, "NX");

  if (result !== "OK") {
    return null;
  }

  return { key, value };
}

export async function releaseLock(redis: Redis, lock: LockHandle) {
  await redis.eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
    1,
    lock.key,
    lock.value,
  );
}

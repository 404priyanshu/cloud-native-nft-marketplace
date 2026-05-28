import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { JwtService } from "@nestjs/jwt";
import { privateKeyToAccount } from "viem/accounts";

import { AppConfigService } from "../config/app-config.service.js";
import { AuthService, buildAuthMessage } from "./auth.service.js";

const account = privateKeyToAccount(
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
);

function createAuthService() {
  const redisStore = new Map<string, string>();
  const config = Object.assign(new AppConfigService(), {
    authNonceTtlSeconds: 300,
    jwtExpiresInSeconds: 3600,
    jwtSecret: "test-secret",
  });
  const jwt = new JwtService({
    secret: config.jwtSecret,
    signOptions: { expiresIn: config.jwtExpiresInSeconds },
  });
  const prisma = {
    user: {
      upsert: async ({ create }: { create: { walletAddress: string } }) => ({
        id: "user_1",
        walletAddress: create.walletAddress,
      }),
    },
  };
  const redis = {
    del: async (key: string) => {
      redisStore.delete(key);
    },
    get: async (key: string) => redisStore.get(key) ?? null,
    setex: async (key: string, _seconds: number, value: string) => {
      redisStore.set(key, value);
    },
  };

  return {
    authService: new AuthService(
      config,
      jwt,
      prisma as never,
      redis as never,
    ),
    redisStore,
  };
}

describe("AuthService", () => {
  it("generates a nonce and verifies the matching wallet signature", async () => {
    const { authService } = createAuthService();
    const nonce = await authService.createNonce(account.address);
    const signature = await account.signMessage({ message: nonce.message });
    const result = await authService.verify(account.address, signature);

    assert.equal(result.walletAddress, account.address.toLowerCase());
    assert.ok(result.accessToken.length > 20);
  });

  it("builds stable sign-in messages", () => {
    assert.equal(
      buildAuthMessage(account.address.toLowerCase(), "abc"),
      [
        "Sign in to BlockForge Market.",
        "",
        `Wallet: ${account.address.toLowerCase()}`,
        "Nonce: abc",
      ].join("\n"),
    );
  });
});

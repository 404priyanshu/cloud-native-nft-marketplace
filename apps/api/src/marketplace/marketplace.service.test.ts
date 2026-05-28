import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { NotFoundException } from "@nestjs/common";

import { MarketplaceService } from "./marketplace.service.js";

function createService() {
  const calls: Array<{ model: string; method: string; input: unknown }> = [];
  const prisma = {
    marketplaceEvent: {
      findFirst: async (input: unknown) => {
        calls.push({ input, method: "findFirst", model: "marketplaceEvent" });
        return null;
      },
      findMany: async () => [],
    },
    marketplaceListing: {
      findFirst: async (input: unknown) => {
        calls.push({ input, method: "findFirst", model: "marketplaceListing" });
        return null;
      },
      findMany: async (input: unknown) => {
        calls.push({ input, method: "findMany", model: "marketplaceListing" });
        return [];
      },
    },
    nftToken: {
      findMany: async (input: unknown) => {
        calls.push({ input, method: "findMany", model: "nftToken" });
        return [];
      },
      findUnique: async () => null,
    },
  };

  return {
    calls,
    service: new MarketplaceService(prisma as never),
  };
}

describe("MarketplaceService", () => {
  it("passes listing status filters through to Prisma", async () => {
    const { calls, service } = createService();

    await service.listListings("ACTIVE");

    assert.match(JSON.stringify(calls[0]?.input), /"status":"ACTIVE"/);
  });

  it("throws NotFoundException for missing transactions", async () => {
    const { service } = createService();

    await assert.rejects(() => service.getTransaction("0xabc"), {
      constructor: NotFoundException,
    });
  });
});

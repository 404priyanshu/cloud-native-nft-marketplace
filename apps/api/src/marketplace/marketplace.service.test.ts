import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { NotFoundException } from "@nestjs/common";

import { MarketplaceService } from "./marketplace.service.js";

type TestListing = {
  chainId: number;
  nftContractAddress: string;
  tokenId: string;
};

function createService({
  listings = [],
  nftTokens = [],
}: {
  listings?: TestListing[];
  nftTokens?: Array<{ chainId: number; contractAddress: string; tokenId: string }>;
} = {}) {
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
        return listings;
      },
    },
    nftToken: {
      findMany: async (input: unknown) => {
        calls.push({ input, method: "findMany", model: "nftToken" });
        return nftTokens;
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

  it("enriches listings with matching indexed NFT metadata", async () => {
    const listing = {
      chainId: 31337,
      nftContractAddress: "0xABCDEF",
      tokenId: "3",
    };
    const nft = {
      chainId: 31337,
      contractAddress: "0xabcdef",
      name: "Crystal Core #03",
      tokenId: "3",
    };
    const { service } = createService({
      listings: [listing],
      nftTokens: [nft],
    });

    const result = await service.listListings("ACTIVE");

    assert.equal(result[0]?.nft, nft);
  });

  it("normalizes seller wallet lookups before querying listings", async () => {
    const { calls, service } = createService();

    await service.listListingsBySeller("0xABCDEF");

    assert.match(
      JSON.stringify(calls[0]?.input),
      /"sellerAddress":"0xabcdef"/,
    );
  });

  it("throws NotFoundException for missing transactions", async () => {
    const { service } = createService();

    await assert.rejects(() => service.getTransaction("0xabc"), {
      constructor: NotFoundException,
    });
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { PrismaClient } from "@blockforge/database";

import { applyIndexedEvent, type IndexedEvent } from "./events.js";

const marketplaceAddress = "0x00000000000000000000000000000000000000aa";
const nftAddress = "0x00000000000000000000000000000000000000bb";
const sellerAddress = "0x00000000000000000000000000000000000000cc";
const buyerAddress = "0x00000000000000000000000000000000000000dd";

function fakePrisma() {
  const calls: Array<{ model: string; method: string; input: unknown }> = [];

  return {
    calls,
    prisma: {
      marketplaceEvent: {
        upsert(input: unknown) {
          calls.push({ input, method: "upsert", model: "marketplaceEvent" });
          return Promise.resolve(input);
        },
      },
      marketplaceListing: {
        update(input: unknown) {
          calls.push({ input, method: "update", model: "marketplaceListing" });
          return Promise.resolve(input);
        },
        upsert(input: unknown) {
          calls.push({ input, method: "upsert", model: "marketplaceListing" });
          return Promise.resolve(input);
        },
      },
      nftToken: {
        update(input: unknown) {
          calls.push({ input, method: "update", model: "nftToken" });
          return Promise.resolve(input);
        },
        upsert(input: unknown) {
          calls.push({ input, method: "upsert", model: "nftToken" });
          return Promise.resolve(input);
        },
      },
    } as unknown as PrismaClient,
  };
}

describe("applyIndexedEvent", () => {
  it("maps NFTListed into event, NFT owner, and active listing upserts", async () => {
    const { calls, prisma } = fakePrisma();
    const event: IndexedEvent = {
      args: {
        listingId: 1n,
        nftContract: nftAddress,
        price: 100n,
        seller: sellerAddress,
        tokenId: 7n,
      },
      blockNumber: 10n,
      blockTimestamp: new Date("2026-05-28T00:00:00.000Z"),
      contractAddress: marketplaceAddress,
      logIndex: 0,
      name: "NFTListed",
      txHash: "0x01",
    };

    await applyIndexedEvent(
      prisma,
      { chainId: 31337, marketplaceAddress },
      event,
    );

    assert.deepEqual(
      calls.map((call) => `${call.model}.${call.method}`),
      [
        "marketplaceEvent.upsert",
        "nftToken.upsert",
        "marketplaceListing.upsert",
      ],
    );
    assert.match(JSON.stringify(calls[2]?.input), /"status":"ACTIVE"/);
    assert.match(JSON.stringify(calls[2]?.input), /"priceWei":"100"/);
  });

  it("maps NFTSold into a sold listing update and buyer ownership update", async () => {
    const { calls, prisma } = fakePrisma();
    const event: IndexedEvent = {
      args: {
        buyer: buyerAddress,
        listingId: 1n,
        nftContract: nftAddress,
        price: 100n,
        seller: sellerAddress,
        tokenId: 7n,
      },
      blockNumber: 11n,
      blockTimestamp: new Date("2026-05-28T00:01:00.000Z"),
      contractAddress: marketplaceAddress,
      logIndex: 1,
      name: "NFTSold",
      txHash: "0x02",
    };

    await applyIndexedEvent(
      prisma,
      { chainId: 31337, marketplaceAddress },
      event,
    );

    assert.deepEqual(
      calls.map((call) => `${call.model}.${call.method}`),
      ["marketplaceEvent.upsert", "marketplaceListing.update", "nftToken.update"],
    );
    assert.match(JSON.stringify(calls[1]?.input), /"status":"SOLD"/);
    assert.match(JSON.stringify(calls[2]?.input), new RegExp(buyerAddress));
  });
});

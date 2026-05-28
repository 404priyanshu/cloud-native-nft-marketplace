import type { Prisma, PrismaClient } from "@blockforge/database";
import type { Address, Hex } from "viem";

export type IndexedEvent =
  | {
      name: "NFTMinted";
      contractAddress: Address;
      txHash: Hex;
      logIndex: number;
      blockNumber: bigint;
      blockTimestamp: Date | null;
      args: {
        owner: Address;
        tokenId: bigint;
        tokenURI: string;
      };
    }
  | {
      name: "NFTListed";
      contractAddress: Address;
      txHash: Hex;
      logIndex: number;
      blockNumber: bigint;
      blockTimestamp: Date | null;
      args: {
        listingId: bigint;
        seller: Address;
        nftContract: Address;
        tokenId: bigint;
        price: bigint;
      };
    }
  | {
      name: "NFTSold";
      contractAddress: Address;
      txHash: Hex;
      logIndex: number;
      blockNumber: bigint;
      blockTimestamp: Date | null;
      args: {
        listingId: bigint;
        buyer: Address;
        seller: Address;
        nftContract: Address;
        tokenId: bigint;
        price: bigint;
      };
    }
  | {
      name: "ListingCancelled";
      contractAddress: Address;
      txHash: Hex;
      logIndex: number;
      blockNumber: bigint;
      blockTimestamp: Date | null;
      args: {
        listingId: bigint;
        seller: Address;
        nftContract: Address;
        tokenId: bigint;
      };
    };

export type IndexerContext = {
  chainId: number;
  marketplaceAddress: Address;
};

function normalizeAddress(address: Address): string {
  return address.toLowerCase();
}

function bigintString(value: bigint): string {
  return value.toString();
}

function jsonPayload(event: IndexedEvent): Prisma.InputJsonObject {
  return JSON.parse(
    JSON.stringify(event.args, (_key, value: unknown) => {
      if (typeof value === "bigint") {
        return value.toString();
      }

      return value;
    }),
  ) as Prisma.InputJsonObject;
}

async function recordEvent(
  prisma: PrismaClient,
  context: IndexerContext,
  event: IndexedEvent,
) {
  await prisma.marketplaceEvent.upsert({
    create: {
      blockNumber: event.blockNumber,
      blockTimestamp: event.blockTimestamp,
      chainId: context.chainId,
      contractAddress: normalizeAddress(event.contractAddress),
      eventName: event.name,
      logIndex: event.logIndex,
      payload: jsonPayload(event),
      txHash: event.txHash,
    },
    update: {},
    where: {
      chainId_txHash_logIndex: {
        chainId: context.chainId,
        logIndex: event.logIndex,
        txHash: event.txHash,
      },
    },
  });
}

export async function applyIndexedEvent(
  prisma: PrismaClient,
  context: IndexerContext,
  event: IndexedEvent,
) {
  await recordEvent(prisma, context, event);

  if (event.name === "NFTMinted") {
    await prisma.nftToken.upsert({
      create: {
        chainId: context.chainId,
        contractAddress: normalizeAddress(event.contractAddress),
        creatorAddress: normalizeAddress(event.args.owner),
        ownerAddress: normalizeAddress(event.args.owner),
        tokenId: bigintString(event.args.tokenId),
        tokenUri: event.args.tokenURI,
      },
      update: {
        creatorAddress: normalizeAddress(event.args.owner),
        ownerAddress: normalizeAddress(event.args.owner),
        tokenUri: event.args.tokenURI,
      },
      where: {
        chainId_contractAddress_tokenId: {
          chainId: context.chainId,
          contractAddress: normalizeAddress(event.contractAddress),
          tokenId: bigintString(event.args.tokenId),
        },
      },
    });

    return;
  }

  if (event.name === "NFTListed") {
    await prisma.nftToken.upsert({
      create: {
        chainId: context.chainId,
        contractAddress: normalizeAddress(event.args.nftContract),
        ownerAddress: normalizeAddress(context.marketplaceAddress),
        tokenId: bigintString(event.args.tokenId),
      },
      update: {
        ownerAddress: normalizeAddress(context.marketplaceAddress),
      },
      where: {
        chainId_contractAddress_tokenId: {
          chainId: context.chainId,
          contractAddress: normalizeAddress(event.args.nftContract),
          tokenId: bigintString(event.args.tokenId),
        },
      },
    });

    await prisma.marketplaceListing.upsert({
      create: {
        chainId: context.chainId,
        listedAt: event.blockTimestamp,
        listedTxHash: event.txHash,
        listingId: bigintString(event.args.listingId),
        marketplaceAddress: normalizeAddress(context.marketplaceAddress),
        nftContractAddress: normalizeAddress(event.args.nftContract),
        priceWei: bigintString(event.args.price),
        sellerAddress: normalizeAddress(event.args.seller),
        status: "ACTIVE",
        tokenId: bigintString(event.args.tokenId),
      },
      update: {
        listedAt: event.blockTimestamp,
        listedTxHash: event.txHash,
        nftContractAddress: normalizeAddress(event.args.nftContract),
        priceWei: bigintString(event.args.price),
        sellerAddress: normalizeAddress(event.args.seller),
        status: "ACTIVE",
        tokenId: bigintString(event.args.tokenId),
      },
      where: {
        chainId_marketplaceAddress_listingId: {
          chainId: context.chainId,
          listingId: bigintString(event.args.listingId),
          marketplaceAddress: normalizeAddress(context.marketplaceAddress),
        },
      },
    });

    return;
  }

  if (event.name === "NFTSold") {
    await prisma.marketplaceListing.update({
      data: {
        buyerAddress: normalizeAddress(event.args.buyer),
        soldAt: event.blockTimestamp,
        soldTxHash: event.txHash,
        status: "SOLD",
      },
      where: {
        chainId_marketplaceAddress_listingId: {
          chainId: context.chainId,
          listingId: bigintString(event.args.listingId),
          marketplaceAddress: normalizeAddress(context.marketplaceAddress),
        },
      },
    });

    await prisma.nftToken.update({
      data: {
        ownerAddress: normalizeAddress(event.args.buyer),
      },
      where: {
        chainId_contractAddress_tokenId: {
          chainId: context.chainId,
          contractAddress: normalizeAddress(event.args.nftContract),
          tokenId: bigintString(event.args.tokenId),
        },
      },
    });

    return;
  }

  await prisma.marketplaceListing.update({
    data: {
      cancelledAt: event.blockTimestamp,
      cancelledTxHash: event.txHash,
      status: "CANCELLED",
    },
    where: {
      chainId_marketplaceAddress_listingId: {
        chainId: context.chainId,
        listingId: bigintString(event.args.listingId),
        marketplaceAddress: normalizeAddress(context.marketplaceAddress),
      },
    },
  });

  await prisma.nftToken.update({
    data: {
      ownerAddress: normalizeAddress(event.args.seller),
    },
    where: {
      chainId_contractAddress_tokenId: {
        chainId: context.chainId,
        contractAddress: normalizeAddress(event.args.nftContract),
        tokenId: bigintString(event.args.tokenId),
      },
    },
  });
}

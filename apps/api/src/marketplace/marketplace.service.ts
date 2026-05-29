import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";
import type { ListingStatusQuery } from "./dto/listing-query.dto.js";

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async listListings(status?: ListingStatusQuery) {
    const listings = await this.prisma.marketplaceListing.findMany({
      orderBy: [{ listedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      where: status ? { status } : undefined,
    });

    if (listings.length === 0) return [];

    const nftTokens = await this.prisma.nftToken.findMany({
      where: {
        OR: listings.map((l) => ({
          chainId: l.chainId,
          contractAddress: l.nftContractAddress.toLowerCase(),
          tokenId: l.tokenId,
        })),
      },
    });

    return listings.map((listing) => {
      const nft = nftTokens.find(
        (n) =>
          n.chainId === listing.chainId &&
          n.contractAddress.toLowerCase() === listing.nftContractAddress.toLowerCase() &&
          n.tokenId === listing.tokenId,
      );
      return {
        ...listing,
        nft,
      };
    });
  }

  async getListing(id: string) {
    const listing = await this.prisma.marketplaceListing.findFirst({
      where: {
        OR: [{ id }, { listingId: id }],
      },
    });

    if (!listing) {
      throw new NotFoundException("Listing not found");
    }

    const nft = await this.prisma.nftToken.findUnique({
      where: {
        chainId_contractAddress_tokenId: {
          chainId: listing.chainId,
          contractAddress: listing.nftContractAddress.toLowerCase(),
          tokenId: listing.tokenId,
        },
      },
    });

    return {
      ...listing,
      nft,
    };
  }

  async listNfts() {
    return this.prisma.nftToken.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });
  }

  async listNftsByOwner(walletAddress: string) {
    return this.prisma.nftToken.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 50,
      where: { ownerAddress: walletAddress.toLowerCase() },
    });
  }

  async listListingsBySeller(walletAddress: string) {
    const listings = await this.prisma.marketplaceListing.findMany({
      orderBy: [{ listedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      where: { sellerAddress: walletAddress.toLowerCase() },
    });

    if (listings.length === 0) return [];

    const nftTokens = await this.prisma.nftToken.findMany({
      where: {
        OR: listings.map((l) => ({
          chainId: l.chainId,
          contractAddress: l.nftContractAddress.toLowerCase(),
          tokenId: l.tokenId,
        })),
      },
    });

    return listings.map((listing) => {
      const nft = nftTokens.find(
        (n) =>
          n.chainId === listing.chainId &&
          n.contractAddress.toLowerCase() === listing.nftContractAddress.toLowerCase() &&
          n.tokenId === listing.tokenId,
      );
      return {
        ...listing,
        nft,
      };
    });
  }

  async getNft(id: string) {
    const nft = await this.prisma.nftToken.findUnique({
      where: { id },
    });

    if (!nft) {
      throw new NotFoundException("NFT not found");
    }

    return nft;
  }

  async listTransactions() {
    const events = await this.prisma.marketplaceEvent.findMany({
      orderBy: [{ blockNumber: "desc" }, { logIndex: "desc" }],
      take: 50,
    });

    return events.map((event) => ({
      ...event,
      blockNumber: event.blockNumber.toString(),
    }));
  }

  async getTransaction(txHash: string) {
    const event = await this.prisma.marketplaceEvent.findFirst({
      orderBy: [{ logIndex: "asc" }],
      where: { txHash },
    });

    if (!event) {
      throw new NotFoundException("Transaction not found");
    }

    return {
      ...event,
      blockNumber: event.blockNumber.toString(),
    };
  }
}

import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service.js";

const listingStatuses = ["ACTIVE", "SOLD", "CANCELLED"] as const;
type ListingStatus = (typeof listingStatuses)[number];

function parseListingStatus(status?: string): ListingStatus | undefined {
  if (status === undefined) {
    return undefined;
  }

  if (listingStatuses.includes(status as ListingStatus)) {
    return status as ListingStatus;
  }

  throw new BadRequestException(
    `status must be one of: ${listingStatuses.join(", ")}`,
  );
}

@Injectable()
export class MarketplaceService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async listListings(status?: string) {
    const listingStatus = parseListingStatus(status);

    return this.prisma.marketplaceListing.findMany({
      orderBy: [{ listedAt: "desc" }, { createdAt: "desc" }],
      take: 50,
      where: listingStatus ? { status: listingStatus } : undefined,
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

    return listing;
  }

  async listNfts() {
    return this.prisma.nftToken.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 50,
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

import { BadRequestException, Inject, Injectable } from "@nestjs/common";

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
}

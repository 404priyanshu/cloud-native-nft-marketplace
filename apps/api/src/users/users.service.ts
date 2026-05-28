import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import { normalizeWalletAddress } from "../common/wallet.js";
import { MarketplaceService } from "../marketplace/marketplace.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class UsersService {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async getUser(walletAddressInput: string) {
    const walletAddress = normalizeWalletAddress(walletAddressInput);
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async listUserNfts(walletAddressInput: string) {
    return this.marketplaceService.listNftsByOwner(
      normalizeWalletAddress(walletAddressInput),
    );
  }

  async listUserListings(walletAddressInput: string) {
    return this.marketplaceService.listListingsBySeller(
      normalizeWalletAddress(walletAddressInput),
    );
  }
}

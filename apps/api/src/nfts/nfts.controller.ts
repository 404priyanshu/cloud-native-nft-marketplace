import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { MarketplaceService } from "../marketplace/marketplace.service.js";

@ApiTags("nfts")
@Controller("nfts")
export class NftsController {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Get()
  @ApiOkResponse({ description: "Indexed NFT tokens." })
  listNfts() {
    return this.marketplaceService.listNfts();
  }

  @Get(":id")
  @ApiOkResponse({ description: "Indexed NFT token by database id." })
  getNft(@Param("id") id: string) {
    return this.marketplaceService.getNft(id);
  }
}

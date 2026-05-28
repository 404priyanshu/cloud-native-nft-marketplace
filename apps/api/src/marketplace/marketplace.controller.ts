import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";

import { MarketplaceService } from "./marketplace.service.js";

@ApiTags("marketplace")
@Controller("marketplace")
export class MarketplaceController {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Get("listings")
  @ApiQuery({
    enum: ["ACTIVE", "SOLD", "CANCELLED"],
    name: "status",
    required: false,
  })
  @ApiOkResponse({ description: "Indexed marketplace listings." })
  listListings(@Query("status") status?: string) {
    return this.marketplaceService.listListings(status);
  }

  @Get("transactions")
  @ApiOkResponse({ description: "Indexed marketplace contract events." })
  listTransactions() {
    return this.marketplaceService.listTransactions();
  }
}

@ApiTags("read-model")
@Controller()
export class ReadModelController {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Get("nfts")
  @ApiOkResponse({ description: "Indexed NFT tokens." })
  listNfts() {
    return this.marketplaceService.listNfts();
  }

  @Get("nfts/:id")
  @ApiOkResponse({ description: "Indexed NFT token by database id." })
  getNft(@Param("id") id: string) {
    return this.marketplaceService.getNft(id);
  }

  @Get("listings")
  @ApiQuery({
    enum: ["ACTIVE", "SOLD", "CANCELLED"],
    name: "status",
    required: false,
  })
  @ApiOkResponse({ description: "Indexed marketplace listings." })
  listRootListings(@Query("status") status?: string) {
    return this.marketplaceService.listListings(status);
  }

  @Get("listings/:id")
  @ApiOkResponse({
    description: "Indexed marketplace listing by database id or on-chain id.",
  })
  getListing(@Param("id") id: string) {
    return this.marketplaceService.getListing(id);
  }

  @Get("transactions")
  @ApiOkResponse({ description: "Indexed marketplace contract events." })
  listRootTransactions() {
    return this.marketplaceService.listTransactions();
  }

  @Get("transactions/:txHash")
  @ApiOkResponse({ description: "Indexed marketplace event by transaction hash." })
  getTransaction(@Param("txHash") txHash: string) {
    return this.marketplaceService.getTransaction(txHash);
  }
}

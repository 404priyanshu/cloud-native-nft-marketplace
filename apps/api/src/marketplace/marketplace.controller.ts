import { Controller, Get, Inject, Query } from "@nestjs/common";
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

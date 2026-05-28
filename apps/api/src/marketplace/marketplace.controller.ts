import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";

import { ListingQueryDto, listingStatuses } from "./dto/listing-query.dto.js";
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
    enum: listingStatuses,
    name: "status",
    required: false,
  })
  @ApiOkResponse({ description: "Indexed marketplace listings." })
  listListings(@Query() query: ListingQueryDto) {
    return this.marketplaceService.listListings(query.status);
  }

  @Get("transactions")
  @ApiOkResponse({ description: "Indexed marketplace contract events." })
  listTransactions() {
    return this.marketplaceService.listTransactions();
  }
}

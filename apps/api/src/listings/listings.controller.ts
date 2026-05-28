import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { ApiOkResponse, ApiQuery, ApiTags } from "@nestjs/swagger";

import {
  ListingQueryDto,
  listingStatuses,
} from "../marketplace/dto/listing-query.dto.js";
import { MarketplaceService } from "../marketplace/marketplace.service.js";

@ApiTags("listings")
@Controller("listings")
export class ListingsController {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Get()
  @ApiQuery({ enum: listingStatuses, name: "status", required: false })
  @ApiOkResponse({ description: "Indexed marketplace listings." })
  listListings(@Query() query: ListingQueryDto) {
    return this.marketplaceService.listListings(query.status);
  }

  @Get(":id")
  @ApiOkResponse({
    description: "Indexed marketplace listing by database id or on-chain id.",
  })
  getListing(@Param("id") id: string) {
    return this.marketplaceService.getListing(id);
  }
}

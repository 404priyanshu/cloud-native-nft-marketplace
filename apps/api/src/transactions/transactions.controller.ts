import { Controller, Get, Inject, Param } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { MarketplaceService } from "../marketplace/marketplace.service.js";

@ApiTags("transactions")
@Controller("transactions")
export class TransactionsController {
  constructor(
    @Inject(MarketplaceService)
    private readonly marketplaceService: MarketplaceService,
  ) {}

  @Get()
  @ApiOkResponse({ description: "Indexed marketplace contract events." })
  listTransactions() {
    return this.marketplaceService.listTransactions();
  }

  @Get(":txHash")
  @ApiOkResponse({ description: "Indexed marketplace event by transaction hash." })
  getTransaction(@Param("txHash") txHash: string) {
    return this.marketplaceService.getTransaction(txHash);
  }
}

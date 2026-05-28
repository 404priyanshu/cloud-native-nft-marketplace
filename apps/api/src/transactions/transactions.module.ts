import { Module } from "@nestjs/common";

import { MarketplaceModule } from "../marketplace/marketplace.module.js";
import { TransactionsController } from "./transactions.controller.js";

@Module({
  controllers: [TransactionsController],
  imports: [MarketplaceModule],
})
export class TransactionsModule {}

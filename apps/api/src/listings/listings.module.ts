import { Module } from "@nestjs/common";

import { MarketplaceModule } from "../marketplace/marketplace.module.js";
import { ListingsController } from "./listings.controller.js";

@Module({
  controllers: [ListingsController],
  imports: [MarketplaceModule],
})
export class ListingsModule {}

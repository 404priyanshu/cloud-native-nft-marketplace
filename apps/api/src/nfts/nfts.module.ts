import { Module } from "@nestjs/common";

import { MarketplaceModule } from "../marketplace/marketplace.module.js";
import { NftsController } from "./nfts.controller.js";

@Module({
  controllers: [NftsController],
  imports: [MarketplaceModule],
})
export class NftsModule {}

import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module.js";
import {
  MarketplaceController,
  ReadModelController,
} from "./marketplace.controller.js";
import { MarketplaceService } from "./marketplace.service.js";

@Module({
  controllers: [MarketplaceController, ReadModelController],
  imports: [PrismaModule],
  providers: [MarketplaceService],
})
export class MarketplaceModule {}

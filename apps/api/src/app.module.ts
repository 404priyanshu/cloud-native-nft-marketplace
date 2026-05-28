import { Module } from "@nestjs/common";

import { HealthModule } from "./health/health.module.js";
import { MarketplaceModule } from "./marketplace/marketplace.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";

@Module({
  imports: [HealthModule, MarketplaceModule, PrismaModule],
})
export class AppModule {}

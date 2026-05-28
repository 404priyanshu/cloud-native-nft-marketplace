import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module.js";
import { AppConfigModule } from "./config/app-config.module.js";
import { HealthModule } from "./health/health.module.js";
import { ListingsModule } from "./listings/listings.module.js";
import { MarketplaceModule } from "./marketplace/marketplace.module.js";
import { NftsModule } from "./nfts/nfts.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { RedisModule } from "./redis/redis.module.js";
import { TransactionsModule } from "./transactions/transactions.module.js";
import { UploadModule } from "./upload/upload.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    HealthModule,
    ListingsModule,
    MarketplaceModule,
    NftsModule,
    PrismaModule,
    RedisModule,
    TransactionsModule,
    UploadModule,
    UsersModule,
  ],
})
export class AppModule {}

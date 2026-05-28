import { Module } from "@nestjs/common";

import { MarketplaceModule } from "../marketplace/marketplace.module.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { UsersController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
  controllers: [UsersController],
  imports: [MarketplaceModule, PrismaModule],
  providers: [UsersService],
})
export class UsersModule {}

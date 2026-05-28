import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AppConfigModule } from "../config/app-config.module.js";
import { AppConfigService } from "../config/app-config.service.js";
import { PrismaModule } from "../prisma/prisma.module.js";
import { RedisModule } from "../redis/redis.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

@Module({
  controllers: [AuthController],
  imports: [
    AppConfigModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        global: false,
        secret: config.jwtSecret,
        signOptions: {
          expiresIn: config.jwtExpiresInSeconds,
        },
      }),
    }),
    PrismaModule,
    RedisModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}

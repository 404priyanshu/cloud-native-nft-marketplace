import { Global, Module } from "@nestjs/common";

import { AppConfigModule } from "../config/app-config.module.js";
import { RedisService } from "./redis.service.js";

@Global()
@Module({
  exports: [RedisService],
  imports: [AppConfigModule],
  providers: [RedisService],
})
export class RedisModule {}

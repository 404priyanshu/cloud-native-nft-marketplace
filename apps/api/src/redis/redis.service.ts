import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Redis } from "ioredis";

import { AppConfigService } from "../config/app-config.service.js";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    @Inject(AppConfigService)
    private readonly config: AppConfigService,
  ) {
    this.client = new Redis(this.config.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async setex(key: string, seconds: number, value: string) {
    await this.client.setex(key, seconds, value);
  }

  async del(key: string) {
    await this.client.del(key);
  }
}

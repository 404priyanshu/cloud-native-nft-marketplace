import { randomBytes } from "node:crypto";

import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { verifyMessage } from "viem";

import { normalizeWalletAddress } from "../common/wallet.js";
import { AppConfigService } from "../config/app-config.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { RedisService } from "../redis/redis.service.js";

const noncePrefix = "auth:nonce";

export function buildAuthMessage(walletAddress: string, nonce: string) {
  return [
    "Sign in to BlockForge Market.",
    "",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
  ].join("\n");
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(AppConfigService)
    private readonly config: AppConfigService,
    @Inject(JwtService)
    private readonly jwt: JwtService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(RedisService)
    private readonly redis: RedisService,
  ) {}

  async createNonce(walletAddressInput: string) {
    const walletAddress = normalizeWalletAddress(walletAddressInput);
    const nonce = randomBytes(16).toString("hex");
    const message = buildAuthMessage(walletAddress, nonce);

    await this.redis.setex(
      this.nonceKey(walletAddress),
      this.config.authNonceTtlSeconds,
      nonce,
    );

    return {
      expiresInSeconds: this.config.authNonceTtlSeconds,
      message,
      nonce,
      walletAddress,
    };
  }

  async verify(walletAddressInput: string, signature: `0x${string}`) {
    const walletAddress = normalizeWalletAddress(walletAddressInput);
    const nonce = await this.redis.get(this.nonceKey(walletAddress));

    if (!nonce) {
      throw new UnauthorizedException("Nonce expired or not found");
    }

    const message = buildAuthMessage(walletAddress, nonce);
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature,
    });

    if (!isValid) {
      throw new UnauthorizedException("Invalid wallet signature");
    }

    await this.redis.del(this.nonceKey(walletAddress));

    const user = await this.prisma.user.upsert({
      create: { walletAddress },
      update: {},
      where: { walletAddress },
    });

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      walletAddress: user.walletAddress,
    });

    return {
      accessToken,
      walletAddress: user.walletAddress,
    };
  }

  private nonceKey(walletAddress: string) {
    return `${noncePrefix}:${walletAddress}`;
  }
}

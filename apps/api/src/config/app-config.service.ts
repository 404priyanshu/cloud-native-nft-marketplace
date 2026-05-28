import { Injectable } from "@nestjs/common";

@Injectable()
export class AppConfigService {
  readonly port = Number(process.env.PORT ?? 3001);
  readonly redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  readonly jwtSecret =
    process.env.JWT_SECRET ?? "blockforge-local-development-secret";
  readonly jwtExpiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS ?? 3600);
  readonly authNonceTtlSeconds = Number(process.env.AUTH_NONCE_TTL_SECONDS ?? 300);
  readonly corsOrigin = process.env.CORS_ORIGIN ?? "*";
  readonly awsRegion = process.env.AWS_REGION ?? "us-east-1";
  readonly s3Bucket = process.env.S3_BUCKET;
  readonly uploadUrlTtlSeconds = Number(
    process.env.UPLOAD_URL_TTL_SECONDS ?? 300,
  );
}

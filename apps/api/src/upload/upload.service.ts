import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";

import { AppConfigService } from "../config/app-config.service.js";

@Injectable()
export class UploadService {
  private readonly s3: S3Client;

  constructor(
    @Inject(AppConfigService)
    private readonly config: AppConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.config.awsRegion,
    });
  }

  async createPresignedUrl(fileName: string, contentType: string) {
    if (!this.config.s3Bucket) {
      throw new ServiceUnavailableException("S3_BUCKET is not configured");
    }

    const key = this.objectKey(fileName);
    const command = new PutObjectCommand({
      Bucket: this.config.s3Bucket,
      ContentType: contentType,
      Key: key,
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: this.config.uploadUrlTtlSeconds,
    });

    return {
      bucket: this.config.s3Bucket,
      expiresInSeconds: this.config.uploadUrlTtlSeconds,
      key,
      method: "PUT" as const,
      url,
    };
  }

  private objectKey(fileName: string) {
    const extension = extname(fileName).toLowerCase();
    return `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
  }
}

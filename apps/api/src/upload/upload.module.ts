import { Module } from "@nestjs/common";

import { AppConfigModule } from "../config/app-config.module.js";
import { UploadController } from "./upload.controller.js";
import { UploadService } from "./upload.service.js";

@Module({
  controllers: [UploadController],
  imports: [AppConfigModule],
  providers: [UploadService],
})
export class UploadModule {}

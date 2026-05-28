import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import {
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
} from "./dto/presigned-url.dto.js";
import { UploadService } from "./upload.service.js";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  constructor(
    @Inject(UploadService)
    private readonly uploadService: UploadService,
  ) {}

  @Post("presigned-url")
  @ApiOkResponse({ type: PresignedUrlResponseDto })
  createPresignedUrl(@Body() body: PresignedUrlRequestDto) {
    return this.uploadService.createPresignedUrl(body.fileName, body.contentType);
  }
}

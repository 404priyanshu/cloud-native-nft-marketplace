import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/json",
] as const;

export class PresignedUrlRequestDto {
  @ApiProperty({ enum: allowedContentTypes })
  @IsIn(allowedContentTypes)
  contentType!: (typeof allowedContentTypes)[number];

  @ApiProperty({ example: "example.png" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  fileName!: string;
}

export class PresignedUrlResponseDto {
  @ApiProperty({ type: String })
  bucket!: string;

  @ApiProperty({ type: String })
  key!: string;

  @ApiProperty({ enum: ["PUT"] })
  method!: "PUT";

  @ApiProperty({ type: String })
  url!: string;

  @ApiProperty({ type: Number })
  expiresInSeconds!: number;
}

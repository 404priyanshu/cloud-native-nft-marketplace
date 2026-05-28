import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress, IsString } from "class-validator";

export class VerifyRequestDto {
  @ApiProperty({ example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" })
  @IsEthereumAddress()
  walletAddress!: string;

  @ApiProperty()
  @IsString()
  signature!: `0x${string}`;
}

export class VerifyResponseDto {
  @ApiProperty({ type: String })
  accessToken!: string;

  @ApiProperty({ type: String })
  walletAddress!: string;
}

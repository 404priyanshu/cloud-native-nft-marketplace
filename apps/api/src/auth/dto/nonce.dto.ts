import { ApiProperty } from "@nestjs/swagger";
import { IsEthereumAddress } from "class-validator";

export class NonceRequestDto {
  @ApiProperty({ example: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" })
  @IsEthereumAddress()
  walletAddress!: string;
}

export class NonceResponseDto {
  @ApiProperty({ type: String })
  walletAddress!: string;

  @ApiProperty({ type: String })
  nonce!: string;

  @ApiProperty({ type: String })
  message!: string;

  @ApiProperty({ type: Number })
  expiresInSeconds!: number;
}

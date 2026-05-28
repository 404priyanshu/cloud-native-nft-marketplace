import { BadRequestException } from "@nestjs/common";
import { getAddress, isAddress } from "viem";

export function normalizeWalletAddress(walletAddress: string): string {
  if (!isAddress(walletAddress)) {
    throw new BadRequestException("walletAddress must be a valid EVM address");
  }

  return getAddress(walletAddress).toLowerCase();
}

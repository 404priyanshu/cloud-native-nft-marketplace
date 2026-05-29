/* ─── API Response Types ─── */

export type ListingStatus = "ACTIVE" | "SOLD" | "CANCELLED";

export interface User {
  id: string;
  walletAddress: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NftToken {
  id: string;
  chainId: number;
  contractAddress: string;
  tokenId: string;
  ownerAddress: string | null;
  creatorAddress: string | null;
  tokenUri: string | null;
  imageUrl: string | null;
  name: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceListing {
  id: string;
  chainId: number;
  marketplaceAddress: string;
  listingId: string;
  nftContractAddress: string;
  tokenId: string;
  sellerAddress: string;
  buyerAddress: string | null;
  priceWei: string;
  status: ListingStatus;
  listedTxHash: string | null;
  soldTxHash: string | null;
  cancelledTxHash: string | null;
  createdAt: string;
  updatedAt: string;
  nft?: NftToken | null;
}

export interface MarketplaceEvent {
  id: string;
  chainId: number;
  contractAddress: string;
  eventName: string;
  txHash: string;
  logIndex: number;
  blockNumber: string;
  blockTimestamp: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface NonceResponse {
  nonce: string;
  message: string;
  walletAddress: string;
  expiresInSeconds: number;
}

export interface VerifyResponse {
  accessToken: string;
  walletAddress: string;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
}

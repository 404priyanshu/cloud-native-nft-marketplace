-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CANCELLED');

-- CreateTable
CREATE TABLE "NftToken" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "ownerAddress" TEXT,
    "tokenUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "marketplaceAddress" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "nftContractAddress" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "buyerAddress" TEXT,
    "priceWei" TEXT NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "listedTxHash" TEXT,
    "soldTxHash" TEXT,
    "cancelledTxHash" TEXT,
    "listedAt" TIMESTAMP(3),
    "soldAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceEvent" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "logIndex" INTEGER NOT NULL,
    "blockNumber" BIGINT NOT NULL,
    "blockTimestamp" TIMESTAMP(3),
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexerCursor" (
    "id" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "lastBlockNumber" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndexerCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NftToken_ownerAddress_idx" ON "NftToken"("ownerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "NftToken_chainId_contractAddress_tokenId_key" ON "NftToken"("chainId", "contractAddress", "tokenId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_chainId_status_idx" ON "MarketplaceListing"("chainId", "status");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerAddress_idx" ON "MarketplaceListing"("sellerAddress");

-- CreateIndex
CREATE INDEX "MarketplaceListing_buyerAddress_idx" ON "MarketplaceListing"("buyerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceListing_chainId_marketplaceAddress_listingId_key" ON "MarketplaceListing"("chainId", "marketplaceAddress", "listingId");

-- CreateIndex
CREATE INDEX "MarketplaceEvent_chainId_contractAddress_eventName_idx" ON "MarketplaceEvent"("chainId", "contractAddress", "eventName");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceEvent_chainId_txHash_logIndex_key" ON "MarketplaceEvent"("chainId", "txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "IndexerCursor_chainId_contractAddress_key" ON "IndexerCursor"("chainId", "contractAddress");

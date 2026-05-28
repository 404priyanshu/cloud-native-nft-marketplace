-- Add optional metadata fields used by the read API and indexer.
ALTER TABLE "NftToken"
ADD COLUMN "creatorAddress" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "name" TEXT,
ADD COLUMN "description" TEXT;

CREATE INDEX "NftToken_creatorAddress_idx" ON "NftToken"("creatorAddress");

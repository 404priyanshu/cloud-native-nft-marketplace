# Architecture

This document describes the technical architecture of BlockForge, a cloud-native NFT marketplace.

## High-Level Architecture

```
                                    ┌─────────────────┐
                                    │   User Browser   │
                                    └────────┬────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
                         ▼                   ▼                   │
               ┌──────────────┐    ┌──────────────┐            │
               │   Next.js    │    │   Wallet      │            │
               │   Frontend   │    │ (MetaMask /   │            │
               │              │    │  RainbowKit)  │            │
               └──────┬───────┘    └──────┬────────┘            │
                      │                   │                      │
          API reads   │                   │  Signed transactions │
                      ▼                   ▼                      │
               ┌──────────────┐    ┌──────────────────┐         │
               │   NestJS     │    │    Ethereum       │         │
               │   REST API   │    │    Blockchain     │         │
               │   (port 3001)│    │                   │         │
               └──────┬───────┘    │ ┌──────────────┐  │         │
                      │            │ │BlockForgeNFT │  │         │
                      │            │ │  (ERC-721)   │  │         │
               ┌──────┴──────┐    │ └──────────────┘  │         │
               │             │    │ ┌──────────────────┤         │
               ▼             ▼    │ │BlockForge        │         │
        ┌──────────┐  ┌─────────┐ │ │Marketplace       │         │
        │PostgreSQL│  │  Redis  │ │ │(Escrow + Fees)   │         │
        │ (Read    │  │ (Nonces │ │ └──────────────────┘         │
        │  Index)  │  │  Locks) │ └──────────┬──────────┘         │
        └──────┬───┘  └─────────┘            │                   │
               ▲                              │  Event polling    │
               │                              ▼                   │
               │                    ┌──────────────┐              │
               └────────────────────│   Worker     │              │
                 Idempotent upserts │  (Indexer)   │              │
                                    └──────────────┘              │
```

## Data Flow

### Write Path (User Actions)

1. **Mint:** User fills form → wallet signs `mintNFT(tokenURI)` → NFT contract creates token → emits `NFTMinted` event
2. **List:** User sets price → wallet signs `approve()` then `listNFT()` → marketplace takes escrow → emits `NFTListed` event
3. **Buy:** User clicks "Buy" → wallet signs `buyNFT()` with ETH value → marketplace transfers NFT + splits payment → emits `NFTSold` event
4. **Cancel:** Seller cancels → wallet signs `cancelListing()` → marketplace returns NFT → emits `ListingCancelled` event

### Read Path (Data Indexing)

1. Worker polls blockchain for new blocks since last cursor position
2. Fetches contract events (`NFTMinted`, `NFTListed`, `NFTSold`, `ListingCancelled`) in parallel
3. Sorts events by block number + log index for deterministic ordering
4. Processes each event with idempotent upserts:
   - Creates/updates `NftToken` records (owner, creator, metadata)
   - Creates/updates `MarketplaceListing` records (status, price, buyer)
   - Creates `MarketplaceEvent` records (raw event log)
5. Advances `IndexerCursor` to latest processed block
6. API serves latest indexed state via REST endpoints

## Smart Contracts

### BlockForgeNFT (ERC-721)

- Inherits `ERC721URIStorage` + `Ownable` from OpenZeppelin
- Auto-incrementing token IDs starting at 1
- Public `mintNFT(tokenURI)` — anyone can mint
- Token URI points to metadata JSON (name, description, image URL)

### BlockForgeMarketplace

- Fixed-price marketplace with NFT escrow
- **List:** Seller approves marketplace, then calls `listNFT()`. NFT transferred to marketplace contract via `safeTransferFrom`
- **Buy:** Buyer sends exact ETH price. Contract splits payment: seller receives `price - fee`, platform owner receives fee
- **Cancel:** Only seller can cancel active listings. NFT returned to seller
- **Platform Fee:** Configurable by owner, default 2.5% (250 bps), max 10%
- **Security:** `ReentrancyGuard`, `Ownable`, custom errors, `IERC721Receiver`

## Database Schema

### Models

| Model | Purpose | Unique Key |
|---|---|---|
| `User` | Wallet-based profiles | `walletAddress` |
| `NftToken` | Indexed NFT state | `chainId + contractAddress + tokenId` |
| `MarketplaceListing` | Indexed listing state | `chainId + marketplaceAddress + listingId` |
| `MarketplaceEvent` | Raw event log | `chainId + txHash + logIndex` |
| `IndexerCursor` | Worker block cursor | `chainId + contractAddress` |

### Design Decisions

- **`priceWei` is a string:** Ethereum prices can exceed JavaScript's `Number.MAX_SAFE_INTEGER`. Stored as string, parsed as `BigInt` when needed.
- **`blockNumber` is BigInt:** Same reason — block numbers can be very large on production chains.
- **No foreign keys between `NftToken` and `MarketplaceListing`:** Events may arrive out of order. The worker handles this with upserts.

## Worker Idempotency

The worker is designed to be crash-safe and idempotent:

1. **Unique constraints:** `MarketplaceEvent` has a unique index on `(chainId, txHash, logIndex)`. Duplicate events are silently ignored via `upsert`.
2. **Cursor persistence:** The `IndexerCursor` is only advanced after all events in a block range are processed. On restart, the worker re-processes from the last saved cursor.
3. **Redis lock:** A distributed lock prevents multiple worker instances from indexing the same block range simultaneously. Lock uses a Lua script for atomic compare-and-delete.
4. **Deterministic ordering:** Events are sorted by `(blockNumber, logIndex)` before processing, ensuring consistent state regardless of when the worker runs.

## Authentication Flow

```
Client                          API                     Redis
  │                              │                        │
  │  POST /auth/nonce            │                        │
  │  { walletAddress }           │                        │
  │─────────────────────────────▶│                        │
  │                              │  SET nonce (TTL 5min)  │
  │                              │───────────────────────▶│
  │  { nonce, message }          │                        │
  │◀─────────────────────────────│                        │
  │                              │                        │
  │  Sign message with wallet    │                        │
  │                              │                        │
  │  POST /auth/verify           │                        │
  │  { walletAddress, signature }│                        │
  │─────────────────────────────▶│                        │
  │                              │  GET + DEL nonce       │
  │                              │───────────────────────▶│
  │                              │  verifyMessage()       │
  │                              │  Upsert User           │
  │  { accessToken (JWT) }       │  Issue JWT             │
  │◀─────────────────────────────│                        │
```

## S3 Upload Flow

The API never proxies file bytes. Instead, it generates presigned URLs:

1. Client requests `POST /upload/presigned-url` with `{ fileName, contentType }`
2. API generates a time-limited S3 presigned PUT URL (default 5 min TTL)
3. Client uploads directly to S3 using the presigned URL
4. Client uses the resulting S3 object URL as the NFT image URL

## Deployment Topology (AWS)

```
┌─────────────────────────────────────────────┐
│                    VPC                       │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │         Public Subnet                  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Application Load Balancer (ALB) │  │ │
│  │  └───────────────┬──────────────────┘  │ │
│  └──────────────────┼────────────────────┘ │
│                     │                       │
│  ┌──────────────────┼────────────────────┐ │
│  │         Private Subnet                │ │
│  │                  │                     │ │
│  │   ┌──────────────▼──────────┐         │ │
│  │   │  ECS Fargate Cluster    │         │ │
│  │   │  ┌─────────┐ ┌────────┐│         │ │
│  │   │  │  API    │ │ Worker ││         │ │
│  │   │  │ Service │ │ Service││         │ │
│  │   │  └────┬────┘ └───┬────┘│         │ │
│  │   └───────┼───────────┼─────┘         │ │
│  │           │           │               │ │
│  │   ┌───────▼───┐  ┌───▼────────┐      │ │
│  │   │    RDS    │  │ ElastiCache│      │ │
│  │   │ PostgreSQL│  │   Redis    │      │ │
│  │   └───────────┘  └────────────┘      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌─────────────────┐  ┌────────────────┐   │
│  │   S3 Bucket     │  │  CloudWatch    │   │
│  │ (NFT Assets)    │  │  (Logs/Alarms) │   │
│  └─────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────┘
```

- **ECS Fargate:** Serverless containers for API and Worker — no EC2 management
- **RDS PostgreSQL:** Managed database with automated backups
- **ElastiCache Redis:** Managed Redis for auth nonces and worker locks
- **ALB:** HTTPS termination with ACM certificate
- **S3:** NFT asset storage with presigned URL access
- **CloudWatch:** Centralized logging and monitoring

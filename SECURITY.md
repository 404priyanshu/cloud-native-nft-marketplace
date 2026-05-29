# Security

This document describes the security model and practices used in BlockForge.

## Threat Model

BlockForge is an NFT marketplace where:
- **Assets at risk:** User NFTs (ERC-721 tokens) and ETH payments
- **Trust boundary:** The blockchain is trustless; the backend API is trusted for read operations only
- **Attack surface:** Smart contracts, API endpoints, frontend wallet interactions

## Smart Contract Security

### Protections

| Protection | Implementation |
|---|---|
| **Reentrancy** | `ReentrancyGuard` on all state-changing functions in `BlockForgeMarketplace` |
| **Access control** | `Ownable` for admin functions (fee updates). Seller-only checks for cancel. |
| **Input validation** | Custom errors: `PriceMustBeAboveZero`, `NotTokenOwner`, `NotListingSeller`, `ListingNotActive`, `IncorrectPayment` |
| **Integer overflow** | Solidity 0.8.28 has built-in overflow checks |
| **NFT ownership** | Verified via `ownerOf()` before listing. `safeTransferFrom` validates contract can receive NFTs. |
| **Fee caps** | Platform fee capped at 10% (1000 bps) maximum |
| **ETH transfer safety** | Uses `call{value}` with return value checks. Reverts with `EthTransferFailed` on failure. |

### Trust Assumptions

- The marketplace contract owner (deployer) can update the platform fee but cannot steal NFTs or funds
- Users must approve the marketplace contract to transfer their NFTs before listing
- Buy price must match listing price exactly — no partial payments

## Backend Security

### No Private Keys

The API and worker **never** hold or access private keys. All blockchain writes go through user wallets in the browser. The backend is read-only with respect to the blockchain.

### Wallet Authentication

- No passwords stored. Authentication uses Ethereum message signing (EIP-191).
- **Nonce-based replay protection:** Each sign-in attempt generates a unique nonce stored in Redis with a 5-minute TTL. The nonce is single-use and deleted after verification.
- **Signature verification:** Uses `viem.verifyMessage()` to cryptographically verify the wallet signature matches the address.
- **JWT tokens:** Short-lived access tokens (default 1 hour). Contains only `walletAddress` and `sub` claims.

### API Security

| Measure | Implementation |
|---|---|
| **Input validation** | `class-validator` with `whitelist: true` strips unknown properties |
| **CORS** | Configurable origin (default: allow all in dev, restrict in production) |
| **Rate limiting** | Not yet implemented (future: `@nestjs/throttler`) |
| **SQL injection** | Prisma ORM uses parameterized queries |
| **Response limits** | All list endpoints capped at 50 results |

### S3 Upload Security

- Presigned URLs are time-limited (default 5 minutes)
- API generates URLs but never handles file bytes
- Content-Type is specified at URL generation time
- Bucket policy or application checks should restrict object size and content types before production use; the current Terraform scaffold only configures bucket encryption and CORS.

## Worker Security

- Read-only blockchain access (only calls `getContractEvents`, never sends transactions)
- Redis distributed lock prevents duplicate indexing
- Database writes use unique constraints — duplicate events are idempotent no-ops

## Environment Variables

**Never commit to the repository:**
- `JWT_SECRET` — JWT signing key
- `DATABASE_URL` — Database connection string with credentials
- `REDIS_URL` — Redis connection string
- `SEPOLIA_PRIVATE_KEY` — Contract deployment key (development only)
- `AWS_*` credentials — S3 access

**Safe to commit (in `.env.example`):**
- Default local development values with placeholder credentials
- Port numbers, TTLs, block ranges

## Infrastructure Security (Production)

- **Private subnets:** ECS tasks, RDS, and ElastiCache in private subnets only
- **ALB:** Only public-facing component, with HTTPS (TLS 1.2+)
- **Security groups:** Minimal port exposure. API only reachable from ALB. Database only from ECS.
- **IAM roles:** Least-privilege task execution roles. No broad `AdministratorAccess`.
- **Secrets Manager:** All sensitive configuration stored in AWS Secrets Manager, referenced by ECS task definitions
- **ECR:** Private container registry with image scanning enabled

## Known Limitations

1. **No rate limiting** on API endpoints — vulnerable to DoS
2. **No chain reorganization handling** — could lead to stale indexed data after reorgs
3. **CORS allows all origins** in local development
4. **JWT has no refresh token** flow — users re-authenticate after expiry
5. **No content moderation** for uploaded NFT images
6. **Platform fee recipient** is the contract deployer — no multisig governance

# BlockForge Web

Next.js frontend for the BlockForge marketplace. It reads indexed NFT, listing, transaction, and profile data from the NestJS API, while ownership-changing actions are signed in the browser through wagmi/RainbowKit and sent directly to the smart contracts.

## Local Development

Run from the repository root:

```sh
pnpm dev:web
```

The app runs at `http://localhost:3000` and expects the API at `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3001`.

For local wallet actions, start the full local flow first:

```sh
pnpm infra:up
pnpm db:migrate
pnpm contracts:node
pnpm contracts:deploy
```

Copy the deployed contract addresses into `.env`:

```sh
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=""
```

Then seed/index data if you want populated read screens:

```sh
pnpm contracts:seed-local
pnpm dev:worker
```

## Verification

```sh
pnpm web:lint
pnpm web:typecheck
pnpm web:build
```

## Current Scope

- Implemented: landing, marketplace, mint, NFT detail, profile, dashboard, API data fetching, and contract write hooks for mint/list/buy/cancel.
- Deferred: wallet-auth UI and S3-backed metadata upload integration. The API client already has nonce/signature and presigned upload helpers, but the current mint form uses an inline data URI for local MVP testing.

# Repository Notes

## Workspace Shape

- `pnpm` workspace packages are `apps/*` and `packages/*`; use filtered commands instead of running package tools from random directories.
- Implemented packages: `packages/contracts`, `packages/database`, `packages/shared`, `apps/api`, and `apps/worker`.
- `apps/web` is still a placeholder; root `dev:web` exists but will fail until `@blockforge/web` gets a `package.json`.
- `packages/database` owns Prisma schema/client generation; API and worker build it first and import Prisma from `@blockforge/database`.
- `packages/shared` imports exported contract ABIs from `@blockforge/contracts/abis/*.json`; after ABI-changing Solidity edits, run `pnpm contracts:export-abi`.

## Commands

- Install/update workspace deps with `pnpm install`; the lockfile is `pnpm-lock.yaml`.
- Local Postgres/Redis: `pnpm infra:up`, `pnpm infra:down`, `pnpm infra:logs`.
- API: `pnpm dev:api`, `pnpm api:typecheck`, `pnpm api:build`.
- Worker: `pnpm dev:worker`, `pnpm worker:test`, `pnpm worker:typecheck`, `pnpm worker:build`.
- Database: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`.
- Shared package: `pnpm shared:typecheck`, `pnpm shared:build`.
- Contracts: `pnpm contracts:compile`, `pnpm contracts:test`, `pnpm contracts:node`, `pnpm contracts:deploy` (deploys to `localhost`), `pnpm contracts:seed-local`, `pnpm contracts:export-abi`.

## Contracts

- Read `packages/contracts/AGENTS.md` before touching Solidity, Hardhat config, deployment scripts, or contract tests.
- Hardhat 3 is ESM with `@nomicfoundation/hardhat-toolbox-viem`; TypeScript tests use `node:test`, not Mocha.
- TypeScript contract tests create isolated chains with `const { viem, networkHelpers } = await network.create();`.
- Run one contract test file with `pnpm --filter @blockforge/contracts exec hardhat test nodejs test/BlockForgeMarketplace.ts`.
- `pnpm --filter @blockforge/contracts typecheck` runs `hardhat build && tsc --noEmit`; avoid running multiple Hardhat build/test commands in parallel because they share `packages/contracts/cache`.
- Do not manually edit generated Hardhat `artifacts/` or `cache/`.

## API, Worker, And Data Flow

- `apps/api` is NestJS ESM/NodeNext; relative TypeScript imports need `.js` suffixes for compiled output.
- API loads dotenv in `src/main.ts`, serves health at `/health`, and Swagger at `/docs`.
- Read APIs expose indexed data at `/nfts`, `/listings`, and `/transactions`; legacy `/marketplace/listings` and `/marketplace/transactions` still exist.
- `apps/worker` is a read-only blockchain event indexer. It reads `NFTMinted`, `NFTListed`, `NFTSold`, and `ListingCancelled`, writes idempotent rows to PostgreSQL, and uses Redis as a short-lived lock.
- Worker requires `RPC_URL`, `CHAIN_ID`, `NFT_CONTRACT_ADDRESS`, `MARKETPLACE_CONTRACT_ADDRESS`, `DATABASE_URL`, and `REDIS_URL`; see `.env.example` and `apps/worker/.env.example`.
- Local chain flow is documented in `docs/local-dev.md`: start infra, run migrations, start `pnpm contracts:node`, deploy, copy contract addresses, then run API/worker.

## Database And Env

- Prisma schema is `packages/database/prisma/schema.prisma`; migrations live under `packages/database/prisma/migrations`.
- Prisma uses `DATABASE_URL`; Redis uses `REDIS_URL`. Root `.env.example` has shared local defaults.
- Backend and worker must not hold private keys; contract deployment uses Hardhat config variables like `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`.
- Local Docker Compose only defines `postgres` and `redis`; it does not start API, worker, web, or a Hardhat node.

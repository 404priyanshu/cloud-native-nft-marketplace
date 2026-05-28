# Repository Notes

## Current Shape

- This is a `pnpm` workspace: `apps/*` and `packages/*` are workspace packages.
- Implemented packages: `packages/contracts`, `packages/database`, and `apps/api`.
- `apps/web`, `apps/worker`, and `packages/shared` are still placeholders until their own `package.json` files exist.
- Root `dev:web` and `dev:worker` scripts already exist but will fail until the matching workspace packages are created.

## Contract Package

- Contract work lives in `packages/contracts`; read `packages/contracts/AGENTS.md` before touching Hardhat config, tests, scripts, or Solidity.
- Hardhat 3 uses ESM, `@nomicfoundation/hardhat-toolbox-viem`, and TypeScript tests through `node:test`, not Mocha.
- TypeScript tests create an isolated chain with `const { viem, networkHelpers } = await network.create();`.
- Generated Hardhat `artifacts/` and `cache/` are build outputs; do not edit them manually.

## Commands

- From repo root: `pnpm contracts:compile`, `pnpm contracts:test`, `pnpm contracts:node`, `pnpm contracts:deploy`, `pnpm contracts:export-abi`.
- Contract package verification: `pnpm --filter @blockforge/contracts typecheck` runs `hardhat build && tsc --noEmit`.
- Run only TypeScript contract tests: `pnpm --filter @blockforge/contracts test:node`.
- Run one TypeScript contract test file: `pnpm --filter @blockforge/contracts exec hardhat test nodejs test/BlockForgeMarketplace.ts`.
- Run Solidity contract tests only: `pnpm --filter @blockforge/contracts test:solidity`.
- After ABI-changing Solidity edits, run `pnpm contracts:export-abi` to refresh `packages/contracts/exports/abis/*.json`.
- API verification from root: `pnpm api:typecheck` and `pnpm api:build`.
- Database commands from root: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`.

## API And Database

- `apps/api` is a NestJS ESM package; relative TypeScript imports use `.js` suffixes for NodeNext output.
- `apps/api` exposes Swagger docs at `/docs` and health at `/health`.
- `packages/database` owns `prisma/schema.prisma`; API imports `PrismaClient` from `@blockforge/database`, so build/typecheck scripts build the database package first.
- Prisma uses `DATABASE_URL`; see `apps/api/.env.example` and `packages/database/.env.example`.

## Deployment And Env

- Marketplace deployment module is `packages/contracts/ignition/modules/BlockForgeMarketplace.ts`; do not use stale `Counter` examples.
- Sepolia config reads Hardhat config variables `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`; keep real values out of git.
- `packages/contracts/.env.example` documents the expected Sepolia variables.

# Repository Notes

## Current Shape

- This is a `pnpm` workspace: `apps/*` and `packages/*` are workspace packages.
- Only `packages/contracts` is implemented right now; `apps/web`, `apps/api`, `apps/worker`, `packages/database`, and `packages/shared` are placeholders until their own `package.json` files exist.
- Root `dev:web`, `dev:api`, and `dev:worker` scripts already exist but will fail until the matching workspace packages are created.

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

## Deployment And Env

- Marketplace deployment module is `packages/contracts/ignition/modules/BlockForgeMarketplace.ts`; do not use stale `Counter` examples.
- Sepolia config reads Hardhat config variables `SEPOLIA_RPC_URL` and `SEPOLIA_PRIVATE_KEY`; keep real values out of git.
- `packages/contracts/.env.example` documents the expected Sepolia variables.

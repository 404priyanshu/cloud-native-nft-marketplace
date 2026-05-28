# `@blockforge/contracts`

Hardhat 3 workspace for the smart contracts used by the NFT marketplace.

## Layout

```text
contracts/                  Solidity contracts and Solidity tests (`*.t.sol`)
test/                       TypeScript integration tests
ignition/modules/           Hardhat Ignition deployment modules
scripts/                    Hardhat scripts
hardhat.config.ts           Hardhat configuration
```

## Commands

Run commands from the repository root with pnpm filters:

```sh
pnpm contracts:compile
pnpm contracts:test
pnpm contracts:node
pnpm contracts:deploy
```

Or from this package directory:

```sh
pnpm compile
pnpm test
pnpm test:solidity
pnpm test:node
pnpm deploy
```

## Sepolia deployment

The `sepolia` network is configured in `hardhat.config.ts` using Hardhat config variables:

- `SEPOLIA_RPC_URL`
- `SEPOLIA_PRIVATE_KEY`

For local development, copy `.env.example` to `.env` and fill in values, or use Hardhat's keystore:

```sh
pnpm hardhat keystore set SEPOLIA_RPC_URL
pnpm hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Then deploy with:

```sh
pnpm deploy:sepolia
```

## Current scaffold

The package currently includes a sample `Counter` contract, matching TypeScript tests, Solidity tests, and an Ignition deployment module. Replace these with marketplace contracts as the domain model is finalized.

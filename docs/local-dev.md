# Local Development

Start local infrastructure:

```sh
pnpm infra:up
```

Copy environment examples before running app processes:

```sh
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env
```

Apply database migrations and start the API:

```sh
pnpm db:migrate
pnpm dev:api
```

API health is available at `http://localhost:3001/health`; Swagger docs are available at `http://localhost:3001/docs`.

## Frontend

Start the Next.js frontend in a separate terminal:

```sh
pnpm dev:web
```

The frontend runs at `http://localhost:3000`. It connects to the API at `http://localhost:3001` by default.

## Local Chain And Indexer

Start a local Hardhat node in one terminal:

```sh
pnpm contracts:node
```

Deploy the NFT and marketplace contracts in another terminal:

```sh
pnpm contracts:deploy
```

Copy the deployed `BlockForgeNFT` and `BlockForgeMarketplace` addresses into `.env` and `apps/worker/.env`:

```sh
NFT_CONTRACT_ADDRESS="0x..."
MARKETPLACE_CONTRACT_ADDRESS="0x..."
RPC_URL="http://127.0.0.1:8545"
CHAIN_ID=31337
INDEXER_START_BLOCK=0
```

Also update the frontend env vars in `.env` for wallet interactions:

```sh
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS="0x..."
NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS="0x..."
```

Generate local marketplace events:

```sh
pnpm contracts:seed-local
```

Run the worker:

```sh
pnpm dev:worker
```

The worker reads `NFTMinted`, `NFTListed`, `NFTSold`, and `ListingCancelled` events from the configured contracts, writes idempotent event rows to PostgreSQL, updates NFT/listing read models, and advances the indexer cursor. It uses Redis as a short-lived lock so multiple worker processes do not index the same range at the same time.

Useful read endpoints after events are indexed:

```txt
GET http://localhost:3001/nfts
GET http://localhost:3001/listings?status=ACTIVE
GET http://localhost:3001/transactions
```

## Automated Demo Script

For a one-command full demo setup:

```sh
bash scripts/demo-local.sh
```

This script starts all infrastructure, deploys contracts, seeds events, runs the API and worker, and verifies the data pipeline.

## Terraform Scaffold

AWS infrastructure lives in `infra/terraform`. It is intended as a deployable scaffold for ECS Fargate, ECR, RDS PostgreSQL, ElastiCache Redis, S3, ALB, IAM, and CloudWatch logs. Validate it before applying:

```sh
terraform -chdir=infra/terraform fmt -check
terraform -chdir=infra/terraform init
terraform -chdir=infra/terraform validate
```

This local checkpoint does not require Terraform to run; install the Terraform CLI before validating or applying the AWS stack.

## Troubleshooting

### Port conflicts

If port 5432 (Postgres), 6379 (Redis), 3001 (API), or 3000 (Frontend) is already in use, stop the conflicting service or change the port in the respective `.env` file.

### Hardhat node already running

Kill existing Hardhat processes: `pkill -f hardhat` or `lsof -ti:8545 | xargs kill`

### Worker not indexing

- Verify contract addresses are set correctly in `.env` and `apps/worker/.env`
- Check that the Hardhat node is running on `http://127.0.0.1:8545`
- Look at worker logs for errors

Stop local infrastructure:

```sh
pnpm infra:down
```

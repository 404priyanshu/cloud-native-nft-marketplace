#!/usr/bin/env bash
# ───────────────────────────────────────────────────────────
# BlockForge Local Demo Script
# Starts all services, deploys contracts, seeds events,
# and verifies the full data pipeline.
# ───────────────────────────────────────────────────────────
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[demo]${NC} $1"; }
ok()   { echo -e "${GREEN}  ✅ $1${NC}"; }
warn() { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
fail() { echo -e "${RED}  ❌ $1${NC}"; exit 1; }

cleanup() {
  log "Stopping background processes..."
  [ -n "${HARDHAT_PID:-}" ] && kill "$HARDHAT_PID" 2>/dev/null || true
  [ -n "${API_PID:-}" ] && kill "$API_PID" 2>/dev/null || true
  [ -n "${WORKER_PID:-}" ] && kill "$WORKER_PID" 2>/dev/null || true
}
trap cleanup EXIT

# ─── 1. Copy env files ───
log "Setting up environment files..."
cp -n .env.example .env 2>/dev/null || true
cp -n apps/api/.env.example apps/api/.env 2>/dev/null || true
cp -n apps/worker/.env.example apps/worker/.env 2>/dev/null || true
cp -n packages/database/.env.example packages/database/.env 2>/dev/null || true
ok "Environment files ready"

# ─── 2. Start infrastructure ───
log "Starting PostgreSQL and Redis..."
pnpm infra:up
sleep 3
ok "Infrastructure running"

# ─── 3. Run DB migrations ───
log "Running database migrations..."
pnpm db:migrate
ok "Migrations applied"

# ─── 4. Start Hardhat node ───
log "Starting local Hardhat node..."
pnpm contracts:node > /tmp/blockforge-hardhat.log 2>&1 &
HARDHAT_PID=$!
sleep 4

if ! kill -0 "$HARDHAT_PID" 2>/dev/null; then
  fail "Hardhat node failed to start. Check /tmp/blockforge-hardhat.log"
fi
ok "Hardhat node running (PID $HARDHAT_PID)"

# ─── 5. Deploy contracts ───
log "Deploying contracts..."
DEPLOY_OUTPUT=$(pnpm contracts:deploy 2>&1)
echo "$DEPLOY_OUTPUT"

DEPLOYED_ADDRESSES="packages/contracts/ignition/deployments/chain-31337/deployed_addresses.json"

# Read contract addresses from Ignition's canonical deployment artifact.
NFT_ADDR=$(node -e "const deployed = require('./$DEPLOYED_ADDRESSES'); console.log(deployed['BlockForgeMarketplaceModule#BlockForgeNFT'] || '')")
MARKETPLACE_ADDR=$(node -e "const deployed = require('./$DEPLOYED_ADDRESSES'); console.log(deployed['BlockForgeMarketplaceModule#BlockForgeMarketplace'] || '')")

if [ -z "$NFT_ADDR" ] || [ -z "$MARKETPLACE_ADDR" ]; then
  warn "Could not auto-detect contract addresses. Check deployment output above."
  warn "Please set NFT_CONTRACT_ADDRESS and MARKETPLACE_CONTRACT_ADDRESS in .env manually."
else
  ok "Contracts deployed: NFT=$NFT_ADDR, Marketplace=$MARKETPLACE_ADDR"

  # Update env files with deployed addresses
  cp -n .env apps/web/.env.local 2>/dev/null || true

  for envfile in .env apps/worker/.env apps/web/.env.local; do
    if [ -f "$envfile" ]; then
      sed -i.bak "s|NFT_CONTRACT_ADDRESS=.*|NFT_CONTRACT_ADDRESS=\"$NFT_ADDR\"|" "$envfile"
      sed -i.bak "s|MARKETPLACE_CONTRACT_ADDRESS=.*|MARKETPLACE_CONTRACT_ADDRESS=\"$MARKETPLACE_ADDR\"|" "$envfile"
      sed -i.bak "s|NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=\"$NFT_ADDR\"|" "$envfile"
      sed -i.bak "s|NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS=\"$MARKETPLACE_ADDR\"|" "$envfile"
      rm -f "${envfile}.bak"
    fi
  done
  ok "Contract addresses written to .env files"
fi

# ─── 6. Seed events ───
log "Seeding local marketplace events..."
pnpm contracts:seed-local
ok "Events seeded (3 NFTs: 1 sold, 1 cancelled, 1 active)"

# ─── 7. Start API ───
log "Starting API server..."
pnpm dev:api > /tmp/blockforge-api.log 2>&1 &
API_PID=$!
sleep 5

# Wait for API health
for i in $(seq 1 10); do
  if curl -sf http://localhost:3001/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! curl -sf http://localhost:3001/health > /dev/null 2>&1; then
  fail "API failed to start. Check /tmp/blockforge-api.log"
fi
ok "API running at http://localhost:3001"

# ─── 8. Start Worker ───
log "Starting indexer worker..."
INDEXER_RUN_ONCE=true pnpm dev:worker > /tmp/blockforge-worker.log 2>&1 &
WORKER_PID=$!
sleep 8
ok "Worker ran indexing cycle"

# ─── 9. Verify ───
log "Verifying data pipeline..."

HEALTH=$(curl -sf http://localhost:3001/health)
echo "  Health: $HEALTH"

NFT_COUNT=$(curl -sf http://localhost:3001/nfts | grep -o '"id"' | wc -l | tr -d ' ')
LISTING_COUNT=$(curl -sf http://localhost:3001/listings | grep -o '"id"' | wc -l | tr -d ' ')
TX_COUNT=$(curl -sf http://localhost:3001/transactions | grep -o '"id"' | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}       BlockForge Demo Results         ${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "  NFTs indexed:          ${CYAN}${NFT_COUNT}${NC}"
echo -e "  Listings indexed:      ${CYAN}${LISTING_COUNT}${NC}"
echo -e "  Transactions indexed:  ${CYAN}${TX_COUNT}${NC}"
echo -e ""
echo -e "  API Health:       ${GREEN}http://localhost:3001/health${NC}"
echo -e "  Swagger Docs:     ${GREEN}http://localhost:3001/docs${NC}"
echo -e "  NFTs:             ${GREEN}http://localhost:3001/nfts${NC}"
echo -e "  Listings:         ${GREEN}http://localhost:3001/listings${NC}"
echo -e "  Transactions:     ${GREEN}http://localhost:3001/transactions${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""

if [ "$NFT_COUNT" -ge 3 ] 2>/dev/null; then
  ok "Pipeline verified: events → worker → DB → API ✓"
else
  warn "Expected ≥3 NFTs, got $NFT_COUNT. Worker may still be indexing."
fi

log "Demo is running. Press Ctrl+C to stop all services."
wait

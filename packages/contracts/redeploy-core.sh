#!/usr/bin/env bash
set -e

source .env

echo "Redeploying YieldOptimizerCore to Base Sepolia..."

forge script script/RedeployCore.s.sol:RedeployCore \
  --rpc-url base_sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvvv 2>&1 | tee redeploy-core-output.txt

echo ""
echo "Done. New YieldOptimizerCore address:"
grep "New YieldOptimizerCore:" redeploy-core-output.txt || true
echo ""
echo "Update PUBLIC_YIELD_OPTIMIZER_ADDRESS in:"
echo "  - apps/backend/.env"
echo "  - apps/frontend/.env"
echo "  - Vercel env vars"

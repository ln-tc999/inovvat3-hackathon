#!/usr/bin/env bash
set -e

# Load .env
source .env

if [ -z "$PRIVATE_KEY" ]; then
  echo "ERROR: PRIVATE_KEY is not set in packages/contracts/.env"
  exit 1
fi

if [ -z "$CHAINLINK_SUBSCRIPTION_ID" ]; then
  echo "ERROR: CHAINLINK_SUBSCRIPTION_ID is not set."
  echo "  1. Go to https://functions.chain.link"
  echo "  2. Connect wallet → Base Sepolia → Create Subscription → Fund with LINK"
  echo "  3. Copy the subscription ID into packages/contracts/.env"
  exit 1
fi

echo "Deploying to Base Sepolia..."

forge script script/Deploy.s.sol:Deploy \
  --rpc-url base_sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key "$BASESCAN_API_KEY" \
  -vvvv 2>&1 | tee deploy-output.txt

echo ""
echo "Deploy complete. Addresses saved to deploy-output.txt"
echo ""
echo "Copy these into your .env files:"
grep -E "AgentPolicy:|YieldOptimizerCore:|SafeAgentModule:|AaveV3Adapter:|MorphoAdapter:|AutoYieldConsumer:" deploy-output.txt || true

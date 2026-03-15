#!/bin/bash
set -e

source .env

echo "Redeploying AaveV3Adapter with correct pool address..."
echo "Aave Pool: 0x8bAB6d1b75f19e9eD9fCe8b9BD338844fF79aE27"
echo "YieldOptimizerCore: 0x68026bd66e2310cfb674dF5d171e7811A3A4a5bE"
echo ""

forge script script/RedeployAaveAdapter.s.sol \
  --rpc-url $RPC_URL_BASE_SEPOLIA \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY \
  -vvvv

echo ""
echo "Done. Copy the new AaveV3Adapter address above and update:"
echo "  apps/backend/.env  → AAVE_ADAPTER_ADDRESS"
echo "  apps/frontend/.env → PUBLIC_AAVE_ADAPTER_ADDRESS"

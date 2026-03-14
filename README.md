# DeFAI YieldGuard — Global AutoYield Agent

> "Your AI Agent that earns yield 24/7 while you sleep — anywhere in the world"

Non-custodial AI agent that autonomously optimizes DeFi yield on Base via Aave V3 + Morpho Blue, powered by Chainlink Functions (LLM) + Chainlink Automation.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Astro 5 + React + TailwindCSS + wagmi/viem |
| Backend | Hono (Node.js/TS) |
| Contracts | Solidity 0.8.28 + Foundry |
| Wallet | Safe Smart Account (ERC-4337) |
| AI Decision | Chainlink Functions + Qwen/OpenRouter |
| Automation | Chainlink Automation (6h upkeep) |
| Lending | Aave V3 + Morpho Blue (Base) |

## Quick Start

```bash
# Install deps
pnpm install

# Contracts
cd packages/contracts
forge install
forge build
forge test

# Backend
cp apps/backend/.env.example apps/backend/.env
# fill in keys
pnpm --filter @autoyield/backend dev

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
pnpm --filter @autoyield/frontend dev
```

## Deploy (Base Sepolia)

```bash
cd packages/contracts
cp .env.example .env  # fill PRIVATE_KEY, CHAINLINK_DON_ID, etc.
forge script script/Deploy.s.sol:Deploy \
  --rpc-url https://sepolia.base.org \
  --broadcast --verify
```

## Architecture

```
User EOA Wallet
  ↓ (1-click deploy Safe)
Safe Smart Account
  ↓ (SafeAgentModule enabled)
YieldOptimizerCore
  ↔ Chainlink Automation (every 6h)
  ↓ Chainlink Functions (LLM → JSON decision)
  ↓ AaveV3Adapter / MorphoAdapter
  ↓ Execute via Safe → compound / migrate
```

## Security

- Non-custodial: user controls Safe, agent has limited module permission only
- Kill switch: `AgentPolicy.pauseAgent()` callable by user at any time
- Session keys expire automatically (default 30 days)
- Every action validated on-chain against policy (daily limit, allowlist, risk tier)
- LLM output schema-validated before execution

# Vatiin AI

<div align="center">
  <img src="apps/frontend/public/header-readme.png" alt="Vatiin AI" width="100%" />
</div>

<div align="center">

![Base](https://img.shields.io/badge/Base-0052FF?style=flat&logo=coinbase&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat&logo=solidity&logoColor=white)
![Chainlink](https://img.shields.io/badge/Chainlink-375BD2?style=flat&logo=chainlink&logoColor=white)
![Aave](https://img.shields.io/badge/Aave-B6509E?style=flat&logo=aave&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Astro](https://img.shields.io/badge/Astro-FF5D01?style=flat&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)

</div>

> Your AI Agent that earns yield 24/7 while you sleep — anywhere in the world.

Vatiin AI is a non-custodial autonomous DeFi yield optimization agent deployed on Base. Users set a plain-English instruction once. The agent — powered by Qwen 3 235B via Alibaba DashScope — continuously analyzes yield opportunities across Aave V3 and Morpho Blue, then executes rebalancing actions on-chain every 6 hours via Chainlink Automation.

Live demo: https://vatinn-ai.vercel.app
Backend API: https://autoyieldbackend-production.up.railway.app

---

## Table of Contents

1. [Problem and Solution](#1-problem-and-solution)
2. [Architecture](#2-architecture)
3. [Smart Contracts](#3-smart-contracts)
4. [Feature List](#4-feature-list)
5. [Tech Stack](#5-tech-stack)
6. [24/7 Automation Flow](#6-247-automation-flow)
7. [AI Decision Engine](#7-ai-decision-engine)
8. [On-Chain Transaction Proof](#8-on-chain-transaction-proof)
9. [Getting Started](#9-getting-started)
10. [Environment Variables](#10-environment-variables)
11. [Project Structure](#11-project-structure)
12. [Security Model](#12-security-model)
13. [Deployed Addresses](#13-deployed-addresses)

---

## 1. Problem and Solution

### Problem

DeFi yield is fragmented across dozens of protocols. APYs shift hourly. A user who deposits USDC into Aave today may be earning 2% less than they could on Morpho tomorrow — and they will never know unless they check manually. Existing yield aggregators are custodial, inflexible, or require deep DeFi knowledge to configure.

### Solution

DeFAI YieldGuard gives every user a personal AI agent. The user writes one sentence — "Maximize yield with low risk on stablecoins" — and the agent handles everything else:

- Monitors Aave V3 and Morpho Blue APYs continuously
- Calls Qwen 3 235B LLM to decide whether to rebalance
- Executes supply/withdraw actions on-chain via `YieldOptimizerCore`
- Runs 24/7 via Chainlink Automation (primary) and a backend cron job (fallback)
- Never holds user funds — all assets stay in user-controlled positions

---

## 2. Architecture

```
User Browser (Astro + React + wagmi)
        |
        | wallet connect (RainbowKit)
        |
        v
Frontend (Vercel — SSR via @astrojs/node)
        |
        | REST API calls
        v
Backend (Railway — Hono/Node.js/TypeScript)
        |
        +---> Qwen 3 235B (DashScope Singapore)
        |         LLM yield decision
        |
        +---> viem walletClient
                  |
                  | executeManual() / faucet mint
                  v
         YieldOptimizerCore.sol (Base Sepolia)
                  |
                  +---> AaveV3Adapter --> MockAavePool
                  +---> MorphoAdapter --> Morpho Blue
                  |
                  | validated by
                  v
           AgentPolicy.sol
           (daily limit, risk tier, session expiry)

Chainlink Automation (every 6h)
        |
        | performUpkeep() on-chain
        v
AutoYieldConsumer.sol
        |
        | emits UpkeepPerformed event
        v
Backend watchContractEvent() listener
        |
        | triggers LLM + executeManual
        v
YieldOptimizerCore.sol

Backend node-cron (every 6h, fallback)
        |
        | independent trigger
        v
same LLM + executeManual path
```

---

## 3. Smart Contracts

### YieldOptimizerCore.sol

The central execution contract. Receives structured `YieldAction[]` arrays and routes them to the correct lending adapter.

- `executeBatch(user, actions)` — called by Chainlink, validates against `AgentPolicy`
- `executeManual(user, actions)` — called by backend wallet (owner), skips policy for MVP
- `getPortfolio(user, assets, adapters)` — view function returning balances and APYs
- `registerAdapter(adapter, status)` — owner-only adapter registry
- `ReentrancyGuard` on all state-changing functions

### AgentPolicy.sol

Per-user on-chain policy enforcement.

- `setPolicy(maxRisk, dailyLimit, sessionDuration, instructionHash, allowedProtocols)` — user configures their own policy
- `validateAction(user, protocol, amount)` — checks: policy active, session not expired, protocol allowlisted, daily limit not exceeded
- `pauseAgent()` / `resumeAgent()` — user kill switch, callable at any time
- Daily spend tracked per user per day (`dailySpent[user][day]`)

### AaveV3Adapter.sol (mock)

Implements `ILendingAdapter`. Points to `MockAavePool` on testnet.

- `supply(asset, amount, user)` — transfers tokens to pool, mints aTokens to user
- `withdraw(asset, amount, user)` — redeems aTokens, returns underlying
- `getAPY(asset)` — reads `currentLiquidityRate` from pool reserve data
- `getBalance(asset, user)` — reads aToken balance

### MockAavePool.sol

Minimal Aave V3 pool simulation for testnet.

- Accepts ERC20 deposits, issues corresponding aTokens via `MockERC20.mint()`
- Fixed 4.5% APY (`MOCK_LIQUIDITY_RATE = 45_000_000_000_000_000_000_000_000` in ray)
- `getReserveData()` returns full Aave-compatible struct

### MockERC20.sol

Standard ERC20 with public `mint(to, amount)` — used as both MockUSDC and aUSDC.

### AutoYieldConsumer.sol

Implements both `AutomationCompatibleInterface` and `FunctionsClient`.

- `checkUpkeep()` — returns true when `block.timestamp - lastUpkeep >= interval` (6h)
- `performUpkeep()` — updates `lastUpkeep`, emits `UpkeepPerformed(timestamp)`
- `requestYieldDecision(user, args)` — sends Chainlink Functions request with LLM JS source
- `fulfillRequest(requestId, response)` — decodes ABI-encoded `YieldAction[]`, calls `core.executeBatch()`

### MorphoAdapter.sol

Implements `ILendingAdapter` for Morpho Blue.

- `supply` / `withdraw` via Morpho's `supplyCollateral` / `withdrawCollateral`
- `getAPY` returns 0 on testnet (Morpho APY requires oracle integration)

---

## 4. Feature List

### Onboarding

- Multi-step wizard: Welcome, Risk Tier selection, Asset preferences, Limits configuration, Confirmation, Success
- Risk tiers: Conservative / Moderate / Aggressive
- Time horizon: Short / Medium / Long
- Yield target: user-defined APY goal (1-50%)
- Daily limit: max USD the agent can move per day
- On completion: calls backend `/api/agent/generate-profile` — Qwen LLM generates a named agent persona and a natural-language instruction
- Profile stored in IndexedDB (Dexie.js) — no server-side user data
- `OnboardingGuard` redirects unauthenticated or incomplete users

### Dashboard — Overview

- `TotalPortfolioCard` — total USD value, 24h change, active positions count
- `YieldOverviewCard` — APY trend chart (Recharts), current vs target APY
- `AgentControlsCard` — quick instruction update, pause/resume, run upkeep
- `RiskLimitCard` — current risk score, daily limit usage bar
- `YieldGoalsCard` — progress toward user's APY target
- `ActionHistoryCard` — donut chart of action type distribution
- `DepositCard` — deposit/withdraw USDC or WETH, testnet faucet button
- `RecentActionsCard` — merged feed of on-chain txs + agent history

### Dashboard — Portfolio

- Full portfolio breakdown by asset and protocol
- Balance, APY, and yield earned per position

### Dashboard — Agent Controls (`/dashboard/agent-controls`)

Left column:

- `AgentIdentityCard` — agent name, risk tier badge, wallet address, daily limit, yield target, current strategy
- `AgentInstructionPanel` — textarea with quick suggestion chips, sends to Qwen LLM, shows AI response preview with APY and risk score
- `AgentExecutionLog` — scrollable list of all past executions from IndexedDB with action type badge, APY, and timestamp

Right sidebar:

- `AgentLiveStats` — current APY, total profit, last action time, agent ID, 24/7 automation status panel (Chainlink watcher active/inactive, cron schedule, on-chain execution enabled)
- `AgentActionsPanel` — Pause/Resume, Run Upkeep (manual Chainlink sim), Kill Agent with confirm step
- `AgentAutoUpkeep` — toggle auto-upkeep simulator with interval selector (30s / 1m / 5m), SVG countdown ring, run counter

### Dashboard — History (`/dashboard/history`)

- `TxHistoryTable` — full on-chain transaction table: Type, Asset, Amount, Protocol, Date, Status, BaseScan link
- `RecentActionsCard` — merged agent + on-chain action feed
- `ActionHistoryCard` — donut chart with action distribution
- `HistoryStatsCard` — real-time stats from IndexedDB: total actions, last 24h count, top action type

### Wallet Integration

- RainbowKit with custom accent color (`#ff4800`)
- wagmi v2 + viem
- `getDefaultConfig` with Base Sepolia chain
- WalletConnect project ID configurable via env

### Landing Page

- Scroll-snap layout with 6 sections: Hero, Features, How It Works, About, FAQ, CTA
- Resizable navbar: 100% width at top, animates to 65% centered on scroll with `border-radius: 8px`
- Dark/light theme toggle with CSS variables, persisted in `localStorage`
- Footer as last snap section

### Theme System

- CSS variables: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--accent` (`#ff4800`), `--accent-2` (`#ff7a40`), `--nav`, `--shadow`
- Dark mode default, light mode via `document.documentElement.classList`
- Theme init script in `<head>` prevents flash
- Shared between landing page and all dashboard pages

### Faucet

- Backend endpoint `POST /api/agent/faucet` mints 1000 MockUSDC to any address
- Frontend "Get 1000 test USDC" button in `DepositCard`
- Uses deployer wallet to call `MockERC20.mint(to, amount)`

### Deposit / Withdraw Flow

1. User clicks Deposit in `DepositCard`
2. Frontend calls `writeContractAsync` — user signs ERC20 `approve(AaveV3Adapter, amount)` in wallet
3. Frontend calls `POST /api/agent/deposit` with `{ userAddress, asset, amount, protocol }`
4. Backend calls `ensureApproval()` — checks and approves adapter from backend wallet if needed
5. Backend calls `executeManual(userAddress, [{ protocol: adapter, action: SUPPLY, asset, amount }])`
6. `YieldOptimizerCore` calls `AaveV3Adapter.supply()` which calls `MockAavePool.supply()`
7. Transaction confirmed, `txHash` returned to frontend
8. Frontend saves entry to `txHistory` IndexedDB table
9. `RecentActionsCard` and `TxHistoryTable` update automatically

---

## 5. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Astro 5 (SSR via @astrojs/node) |
| UI components | React 18 + TypeScript |
| Styling | TailwindCSS + CSS variables |
| Wallet | wagmi v2 + viem + RainbowKit |
| Charts | Recharts |
| Forms | react-hook-form + zod |
| Client DB | Dexie.js (IndexedDB) |
| Server queries | TanStack Query v5 |
| Backend framework | Hono (Node.js/TypeScript) |
| Backend runtime | Node.js 20 via tsx |
| Cron | node-cron |
| Smart contracts | Solidity 0.8.28 + Foundry |
| Contract libs | OpenZeppelin 5, Chainlink contracts |
| AI model | Qwen 3 235B A22B (DashScope Singapore) |
| Blockchain | Base Sepolia (testnet) |
| Automation | Chainlink Automation + backend cron fallback |
| Frontend deploy | Vercel |
| Backend deploy | Railway |
| Monorepo | Turborepo + pnpm workspaces |

---

## 6. 24/7 Automation Flow

Two independent trigger paths ensure the agent runs continuously even if one path fails.

### Primary: Chainlink Automation

```
Chainlink Automation Node (every 6h)
  |
  | calls AutoYieldConsumer.performUpkeep()
  v
AutoYieldConsumer.sol
  |
  | emits UpkeepPerformed(timestamp)
  v
Backend publicClient.watchContractEvent()
  |
  | detects event
  v
dashscopeLLMDecision(currentInstruction)
  |
  | returns { protocol, action, amount, reason }
  v
executeManual(userAddress, actions)
  |
  v
YieldOptimizerCore -> AaveV3Adapter -> MockAavePool
```

### Fallback: Backend Cron

```
node-cron (schedule: CRON_SCHEDULE env, default "0 */6 * * *")
  |
  | fires independently of Chainlink
  v
same path: dashscopeLLMDecision -> executeManual
```

### State Sync

When a user updates their instruction via the dashboard, `setAutomationInstruction()` and `setAutomationActive()` are called immediately so both trigger paths use the latest instruction without restart.

### Testing Locally

Set `CRON_SCHEDULE=*/30 * * * * *` in `apps/backend/.env` to trigger every 30 seconds for demo purposes.

---

## 7. AI Decision Engine

Model: `qwen3-235b-a22b` via DashScope Singapore (`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`)

The LLM receives:

- A system prompt with current market data table (Aave/Morpho APYs, TVL, utilization, risk scores)
- The user's natural-language instruction
- Current portfolio positions with USD values and APYs
- Decision framework: only rebalance if improvement exceeds 50bps after gas costs

The LLM returns structured JSON:

```json
{
  "actions": [{ "protocol": "Aave", "action": "supply", "asset": "USDC", "amount": 1000000000 }],
  "reason": "Current Aave USDC rate at 4.5% is optimal for conservative profile. No rebalance needed.",
  "suggestedAPY": 450,
  "riskScore": 2,
  "confidence": 0.94,
  "expectedDailyYieldUSD": 0.12,
  "rebalanceNeeded": false
}
```

`enable_thinking: false` is set to skip chain-of-thought output and reduce latency. Falls back to `mockLLM.ts` if API key is missing or request fails.

---

## 8. On-Chain Transaction Proof

All contracts deployed and verified on Base Sepolia (chain ID 84532).

### Deployment Transactions

| Contract | Deploy Tx | Address |
|---|---|---|
| AgentPolicy | [0x23fc22fb...](https://sepolia.basescan.org/tx/0x23fc22fb0bb43f289567a0d88b861729d6378e2155b14c4dca1bee9829d97aed) | 0xA6ba2CF98B043eA522650535B56Be9bE46371f88 |
| YieldOptimizerCore (v3) | redeployed | 0x778A3D63BC0E575C4943b7D0D389b8EC4d0F26Ac |
| AaveV3Adapter (mock) | redeployed | 0xAc4B8Acc99186e4Cf3547E6DB5caCA92D3D96fCE |
| MorphoAdapter | [0x81b9cf99...](https://sepolia.basescan.org/tx/0x81b9cf9932df979a8a43bcf50efc4e5458283d548a2e955a1a5dc562aa7daa94) | 0xf9B035426d2A16EF00F0547dc0F4Ed9226D2671d |
| AutoYieldConsumer | [0x8f309e01...](https://sepolia.basescan.org/tx/0x8f309e0182612438367d7e162ac59f9a0c844e191bfa0d38cf536678ff64ca2a) | 0xd3029585c3934323743EE7740e67dCDe99DF9802 |
| MockUSDC | redeployed | 0xB26BDd8Ef3eE37128462A0611FAE71E75d2A8Ba3 |
| MockAavePool | redeployed | 0x84e6F125945b706278F2E8AAe8FE49835a224a3C |

### Adapter Registration Transactions

| Action | Tx Hash |
|---|---|
| registerAdapter(AaveV3Adapter, true) | [0x995d2249...](https://sepolia.basescan.org/tx/0x995d22491216d7c38c7911ddbda7aa541866d12867be1999b68b175d4d9390aa) |
| registerAdapter(MorphoAdapter, true) | [0xfd3a7fd5...](https://sepolia.basescan.org/tx/0xfd3a7fd563a2b4910ab853c5ef80fc33f5ce13c5079334994167c2705a298e4b) |

### Sample Deposit Transaction

A successful end-to-end deposit (SUPPLY via executeManual):

```
POST /api/agent/deposit
{ "userAddress": "0x...", "asset": "USDC", "amount": 10, "protocol": "aave" }

Response: { "success": true, "txHash": "0xf7dcbbfb..." }
```

View on BaseScan: https://sepolia.basescan.org

### Faucet Transaction

```
POST /api/agent/faucet
{ "address": "0x...", "amount": 1000 }

Response: { "success": true, "txHash": "0x...", "amount": 1000, "token": "0xB26BDd8..." }
```

Deployer / Backend wallet: `0x72092971935F31734118fD869A768aE17C84dd0B`

---

## 9. Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Foundry (for contracts)

### Install

```bash
pnpm install
```

### Run Backend

```bash
cp apps/backend/.env.example apps/backend/.env
# fill in BACKEND_PRIVATE_KEY and DASHSCOPE_API_KEY
pnpm --filter @autoyield/backend dev
```

Backend starts at `http://localhost:3001`. On startup you will see:

```
Backend running at http://localhost:3001
[Automation] Watching UpkeepPerformed on 0xd302...
[Automation] Cron fallback scheduled: "0 */6 * * *"
[Automation] Both triggers active (Chainlink watcher + Cron fallback)
```

### Run Frontend

```bash
cp apps/frontend/.env.example apps/frontend/.env
# set PUBLIC_API_URL=http://localhost:3001
pnpm --filter @autoyield/frontend dev
```

Frontend starts at `http://localhost:4321`.

### Build Contracts

```bash
cd packages/contracts
forge install
forge build
forge test
```

### Deploy Contracts (Base Sepolia)

```bash
cd packages/contracts
cp .env.example .env
# fill PRIVATE_KEY, RPC_URL_BASE_SEPOLIA
forge script script/DeployMockStack.s.sol:DeployMockStack \
  --rpc-url https://sepolia.base.org \
  --broadcast --verify
```

---

## 10. Environment Variables

### apps/backend/.env

| Variable | Description |
|---|---|
| `PORT` | Server port (default 3001) |
| `RPC_URL_BASE_SEPOLIA` | Base Sepolia RPC URL |
| `BACKEND_PRIVATE_KEY` | Private key of deployer/agent wallet |
| `YIELD_OPTIMIZER_ADDRESS` | YieldOptimizerCore contract address |
| `AAVE_ADAPTER_ADDRESS` | AaveV3Adapter contract address |
| `MORPHO_ADAPTER_ADDRESS` | MorphoAdapter contract address |
| `MOCK_USDC_ADDRESS` | MockERC20 (USDC) contract address |
| `AUTO_YIELD_CONSUMER_ADDRESS` | AutoYieldConsumer contract address |
| `DASHSCOPE_API_KEY` | Alibaba DashScope API key |
| `CRON_SCHEDULE` | node-cron schedule (default `0 */6 * * *`) |
| `AGENT_WALLET_ADDRESS` | Wallet address used for automated upkeep |

### apps/frontend/.env

| Variable | Description |
|---|---|
| `PUBLIC_API_URL` | Backend URL (localhost for dev, Railway for prod) |
| `PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
| `PUBLIC_AAVE_ADAPTER_ADDRESS` | AaveV3Adapter address (for ERC20 approve) |
| `PUBLIC_MOCK_USDC_ADDRESS` | MockUSDC address |
| `PUBLIC_YIELD_OPTIMIZER_ADDRESS` | YieldOptimizerCore address |

---

## 11. Project Structure

```
vatiin-hackathon/
├── apps/
│   ├── backend/
│   │   └── src/
│   │       ├── index.ts              # Hono server + automation startup
│   │       ├── routes/
│   │       │   └── agent.ts          # All /api/agent/* endpoints
│   │       ├── services/
│   │       │   ├── automation.ts     # Chainlink watcher + cron fallback
│   │       │   ├── dashscopeLLM.ts   # Qwen 3 LLM integration
│   │       │   ├── mockLLM.ts        # Fallback mock decisions
│   │       │   ├── onchain.ts        # viem executeManual, faucet, portfolio
│   │       │   ├── profileGenerator.ts # LLM-generated risk profiles
│   │       │   └── yieldOptimizer.ts # Mock upkeep simulation
│   │       └── types.ts
│   └── frontend/
│       └── src/
│           ├── pages/
│           │   ├── index.astro
│           │   ├── onboarding.astro
│           │   └── dashboard/
│           │       ├── index.astro
│           │       ├── portfolio.astro
│           │       ├── agent-controls.astro
│           │       └── history.astro
│           ├── islands/
│           │   ├── dashboard/
│           │   │   ├── agent/        # Agent controls page components
│           │   │   ├── DashboardShell.tsx
│           │   │   ├── DepositCard.tsx
│           │   │   ├── RecentActionsCard.tsx
│           │   │   ├── TxHistoryTable.tsx
│           │   │   └── ...
│           │   └── onboarding/
│           │       ├── OnboardingShell.tsx
│           │       ├── steps/
│           │       └── useOnboarding.ts
│           ├── lib/
│           │   ├── api.ts            # Typed fetch wrappers
│           │   ├── db.ts             # Dexie IndexedDB schema
│           │   ├── wagmi.ts          # wagmi + RainbowKit config
│           │   └── useTheme.ts
│           └── styles/global.css     # CSS variables + utility classes
└── packages/
    └── contracts/
        ├── src/
        │   ├── YieldOptimizerCore.sol
        │   ├── AgentPolicy.sol
        │   ├── AutoYieldConsumer.sol
        │   ├── adapters/
        │   │   ├── AaveV3Adapter.sol
        │   │   └── MorphoAdapter.sol
        │   ├── interfaces/
        │   │   └── ILendingAdapter.sol
        │   └── mocks/
        │       ├── MockERC20.sol
        │       └── MockAavePool.sol
        └── script/
            ├── Deploy.s.sol
            └── DeployMockStack.s.sol
```

---

## 12. Security Model

### Non-Custodial

The agent never holds user funds. All assets remain in the user's positions on Aave/Morpho. The backend wallet (`executeManual`) can only call `YieldOptimizerCore` — it cannot transfer tokens directly.

### Kill Switch

`AgentPolicy.pauseAgent()` is callable by the user at any time from any wallet. This sets `policy.active = false`, causing all subsequent `validateAction()` calls to revert with `PolicyNotActive`.

### Daily Limits

`AgentPolicy` tracks `dailySpent[user][day]`. If a proposed action would exceed the user's configured daily limit, the transaction reverts with `DailyLimitExceeded`.

### Session Expiry

Each policy has a `sessionExpiry` timestamp. After expiry, all agent actions revert with `SessionExpired`. Users must call `setPolicy()` again to renew.

### Protocol Allowlist

Only protocols explicitly added to `protocolAllowlist[user][protocol]` can be used by the agent for that user. Attempting to use an unlisted protocol reverts with `ProtocolNotAllowed`.

### Adapter Registry

`YieldOptimizerCore` maintains a `registeredAdapters` mapping. Only registered adapters can be called. Unregistered adapters revert with `AdapterNotRegistered`.

### Reentrancy

All state-changing functions in `YieldOptimizerCore` use OpenZeppelin `ReentrancyGuard`.

### LLM Output Validation

LLM JSON responses are schema-validated before any on-chain call. If the response is malformed or missing required fields, the system falls back to `mockLLM.ts` and logs the error — no transaction is sent.

---

## 13. Deployed Addresses

Network: Base Sepolia (chain ID 84532)

| Contract | Address |
|---|---|
| AgentPolicy | `0xA6ba2CF98B043eA522650535B56Be9bE46371f88` |
| YieldOptimizerCore (v3) | `0x778A3D63BC0E575C4943b7D0D389b8EC4d0F26Ac` |
| AaveV3Adapter (mock) | `0xAc4B8Acc99186e4Cf3547E6DB5caCA92D3D96fCE` |
| MorphoAdapter | `0xf9B035426d2A16EF00F0547dc0F4Ed9226D2671d` |
| AutoYieldConsumer | `0xd3029585c3934323743EE7740e67dCDe99DF9802` |
| MockUSDC | `0xB26BDd8Ef3eE37128462A0611FAE71E75d2A8Ba3` |
| MockAavePool | `0x84e6F125945b706278F2E8AAe8FE49835a224a3C` |
| Deployer / Backend wallet | `0x72092971935F31734118fD869A768aE17C84dd0B` |

BaseScan: https://sepolia.basescan.org

---

## API Reference

### GET /api/health

Returns server status.

### GET /api/agent/status

Returns current agent state: active, lastAction, currentAPY, totalProfitUSD, portfolio.

### POST /api/agent/set-instruction

```json
{ "instruction": "Maximize yield with low risk", "userAddress": "0x..." }
```

Calls Qwen LLM, updates agent state, returns `{ preview, suggestedAPY, riskScore }`.

### POST /api/agent/pause

```json
{ "active": false }
```

### POST /api/agent/mock-upkeep

Simulates a Chainlink Automation trigger. Calls LLM and updates portfolio state.

### POST /api/agent/deposit

```json
{ "userAddress": "0x...", "asset": "USDC", "amount": 100, "protocol": "aave" }
```

Calls `executeManual(SUPPLY)` on-chain. Returns `{ success, txHash }`.

### POST /api/agent/withdraw

```json
{ "userAddress": "0x...", "asset": "USDC", "amount": 100, "protocol": "aave" }
```

### POST /api/agent/faucet

```json
{ "address": "0x...", "amount": 1000 }
```

Mints MockUSDC to address. Testnet only.

### GET /api/agent/portfolio/:address

Returns on-chain portfolio balances and APYs for address.

### POST /api/agent/generate-profile

```json
{
  "riskTier": "moderate",
  "preferredAssets": ["USDC"],
  "timeHorizon": "medium",
  "yieldTarget": 8
}
```

Returns LLM-generated agent persona and instruction.

### GET /api/agent/automation-status

Returns Chainlink watcher status, cron schedule, and on-chain execution status.

---

_Last updated: March 2026_

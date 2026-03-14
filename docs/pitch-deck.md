# DeFAI YieldGuard — Pitch Deck (YC Format)

---

## Slide 1 — Company Purpose

> **"DeFAI YieldGuard is a non-custodial AI agent that autonomously maximizes your DeFi yield 24/7 — without ever touching your keys."**

---

## Slide 2 — Problem

- DeFi yield tersebar di puluhan protokol (Aave, Morpho, Compound, dll) — APY berubah setiap jam
- User harus manual monitor, rebalance, dan compound — butuh waktu & keahlian teknis
- 95% retail DeFi user meninggalkan dana di protokol suboptimal karena tidak tahu atau malas
- Solusi existing (yield aggregator) bersifat custodial atau tidak fleksibel terhadap preferensi user

---

## Slide 3 — Solution

- AI agent berbasis LLM (via Chainlink Functions) yang berjalan on-chain setiap 6 jam
- Otomatis analisis pool terbaik → eksekusi rebalance via Safe Smart Account (ERC-4337)
- User tetap pegang kunci — agent hanya punya permission terbatas (module-based, kill switch tersedia)
- Cukup satu instruksi natural language: _"Maximize yield, max risk 5"_ → agent kerja sendiri

---

## Slide 4 — Why Now

- **Base (L2 Coinbase)** tumbuh pesat — TVL DeFi Base naik 10x dalam 12 bulan terakhir
- **Chainlink Functions** baru GA — pertama kalinya LLM bisa dipanggil secara verifiable on-chain
- **ERC-4337 (Account Abstraction)** sudah mature — Safe Smart Account jadi standar industri
- **DeFAI narrative** sedang puncak — intersection AI + DeFi yang belum ada pemain dominannya

---

## Slide 5 — Product

### How It Works

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

### Key Features

- Dashboard: portfolio overview, yield earned hari ini, agent status real-time
- Agent controls: set instruksi natural language, risk limit (1-10), kill switch
- Non-custodial by design: user deploy Safe sendiri, agent hanya punya module permission
- LLM output divalidasi schema sebelum eksekusi on-chain

### Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Astro 5 + React + TailwindCSS + wagmi/viem |
| Backend | Hono (Node.js/TypeScript) |
| Contracts | Solidity 0.8.28 + Foundry |
| Wallet | Safe Smart Account (ERC-4337) |
| AI Decision | Chainlink Functions + Qwen 2.5 72B (OpenRouter) |
| Automation | Chainlink Automation (6h upkeep) |
| Lending | Aave V3 + Morpho Blue (Base) |

---

## Slide 6 — Traction

- ✅ Deployed di Base Sepolia (testnet)
- ✅ MVP fungsional: agent loop end-to-end berjalan (Automation → Functions → Adapter → Safe)
- ✅ Dashboard live dengan portfolio tracking & agent controls
- [ ] Beta user: _[tambahkan jumlah]_
- [ ] Testnet TVL: _[tambahkan angka]_
- [ ] Feedback awal: _[tambahkan quote/testimonial]_

---

## Slide 7 — Market Size

| Segment | Estimasi |
|---|---|
| DeFi TVL Global | ~$100B+ |
| Yield Farming Market (aktif) | ~$20B |
| Wallet aktif di Base | ~500K+ |
| SAM (user yang mau delegate yield) | ~5-10% = **$1-2B** |

Target awal: retail DeFi user di Base yang punya stablecoin idle dan tidak mau repot manage sendiri.

---

## Slide 8 — Business Model

- **Performance fee**: 10% dari yield yang dihasilkan agent — user hanya bayar kalau profit
- **Subscription**: tier premium untuk fitur advanced (custom strategy, multi-chain, priority execution)
- **B2B / DAO Treasury**: white-label agent untuk DAO yang butuh yield management otomatis

Model performance fee sangat aligned dengan user — kami untung hanya kalau user untung.

---

## Slide 9 — Competition

| | YieldGuard | Yearn | Beefy | Instadapp |
|---|---|---|---|---|
| Non-custodial | ✅ | ❌ | ❌ | Partial |
| AI / LLM decision | ✅ | ❌ | ❌ | ❌ |
| Natural language UX | ✅ | ❌ | ❌ | ❌ |
| On-chain verifiable execution | ✅ | ✅ | ✅ | ✅ |
| Kill switch by user | ✅ | ❌ | ❌ | Partial |
| Account Abstraction (ERC-4337) | ✅ | ❌ | ❌ | ✅ |

Keunggulan utama: **satu-satunya yield optimizer yang non-custodial + AI-driven + verifiable on-chain**.

---

## Slide 10 — Team

- **[Founder 1]** — [background: smart contract / DeFi protocol experience]
- **[Founder 2]** — [background: AI/ML atau full-stack Web3]

_Domain expertise: DeFi protocol mechanics + AI agent systems + smart contract security_

---

## Slide 11 — The Ask

- **Raising**: $[X]
- **Use of funds**:
  - Smart contract audit (40%)
  - Mainnet launch & infrastructure (30%)
  - Growth & Base ecosystem marketing (30%)
- **Milestone 12 bulan**:
  - $[X]M TVL under management
  - [X]K active agents deployed
  - Mainnet live di Base + ekspansi ke Arbitrum / Optimism

---

## Security Notes

- Non-custodial: user controls Safe, agent hanya punya limited module permission
- Kill switch: `AgentPolicy.pauseAgent()` bisa dipanggil user kapan saja
- Session keys expire otomatis (default 30 hari)
- Setiap action divalidasi on-chain terhadap policy (daily limit, allowlist, risk tier)
- LLM output divalidasi schema sebelum eksekusi

---

_Last updated: March 2026_

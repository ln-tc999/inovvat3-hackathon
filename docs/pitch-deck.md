# DeFAI YieldGuard — Pitch Deck

---

## Slide 1 — Project Title & Team Details

### DeFAI YieldGuard
> **"Non-custodial AI agent that autonomously maximizes your DeFi yield 24/7 — without ever touching your keys."**

**Tagline:** _Set your strategy once. Let the agent do the rest._

**Team:**
- **[Founder 1]** — Smart Contract Engineer | DeFi Protocol Experience | Solidity / Foundry
- **[Founder 2]** — Full-Stack Web3 + AI/ML | Frontend & Backend | wagmi / Hono / LLM Integration

**Built for:** Base Ecosystem Hackathon — March 2026
**Deployed on:** Base Sepolia (Testnet)

---

## Slide 2 — Problem Statement & Proposed Solution

### Problem

- DeFi yield tersebar di puluhan protokol (Aave, Morpho, Compound, dll) — APY berubah setiap jam
- User harus manual monitor, rebalance, dan compound — butuh waktu & keahlian teknis tinggi
- **95% retail DeFi user** meninggalkan dana di protokol suboptimal karena tidak tahu atau tidak sempat
- Solusi existing (Yearn, Beefy) bersifat **custodial** — user harus serahkan aset ke smart contract pihak ketiga
- Tidak ada solusi yang menggabungkan AI decision-making + non-custodial + verifiable on-chain execution

### Proposed Solution

**DeFAI YieldGuard** adalah AI agent yang:
1. Berjalan otomatis setiap 6 jam via **Chainlink Automation**
2. Menggunakan **LLM (Qwen 2.5 72B)** untuk analisis pool terbaik berdasarkan instruksi user
3. Mengeksekusi rebalance via **Safe Smart Account (ERC-4337)** — user tetap pegang kunci
4. Cukup satu instruksi natural language: _"Maximize yield, max risk 5"_ → agent kerja sendiri

---

## Slide 3 — Idea, Uniqueness, and Problem Addressal

### Core Idea

Gabungkan tiga teknologi yang baru mature secara bersamaan:
- **Chainlink Functions** → LLM bisa dipanggil secara verifiable on-chain (baru GA 2024)
- **ERC-4337 Account Abstraction** → Safe Smart Account sebagai non-custodial execution layer
- **DeFAI narrative** → intersection AI + DeFi yang belum ada pemain dominannya

### Uniqueness

| Fitur | YieldGuard | Yearn | Beefy | Instadapp |
|---|---|---|---|---|
| Non-custodial | ✅ | ❌ | ❌ | Partial |
| AI / LLM decision | ✅ | ❌ | ❌ | ❌ |
| Natural language UX | ✅ | ❌ | ❌ | ❌ |
| On-chain verifiable execution | ✅ | ✅ | ✅ | ✅ |
| Kill switch by user | ✅ | ❌ | ❌ | Partial |
| Account Abstraction (ERC-4337) | ✅ | ❌ | ❌ | ✅ |

### How It Addresses the Problem

- **Custodial problem** → Solved via Safe module permission: agent hanya punya limited access, bukan full custody
- **Complexity problem** → Solved via natural language instruction: tidak perlu paham DeFi mechanics
- **Suboptimal yield problem** → Solved via 6-hour automated rebalancing dengan LLM decision engine
- **Trust problem** → Solved via on-chain policy validation: setiap action dicek terhadap risk limit & daily cap user

---

## Slide 4 — Technical Approach

### Smart Contracts (Solidity 0.8.28 + Foundry)

| Contract | Fungsi |
|---|---|
| `YieldOptimizerCore` | Orchestrator utama — eksekusi action via Safe module |
| `AgentPolicy` | Menyimpan risk profile user (max risk, daily limit, session duration) |
| `AaveV3Adapter` | Interface ke Aave V3 lending pool di Base |
| `MorphoAdapter` | Interface ke Morpho Blue di Base |
| `AutoYieldConsumer` | Chainlink Functions consumer — memanggil LLM off-chain |

### Backend (Hono / Node.js / TypeScript)

- REST API untuk agent controls, deposit/withdraw, portfolio query
- Integrasi Qwen 2.5 72B via DashScope API sebagai LLM fallback
- Automation service dengan cron fallback (setiap 6 jam)

### Frontend (Astro 5 + React + wagmi/viem)

- Dashboard real-time: portfolio, yield earned, agent status
- Onboarding flow: risk profiling → LLM generate agent personality → deploy policy on-chain
- Wallet connect via wagmi, state persistence via IndexedDB (Dexie.js)

### Tech Stack Summary

| Layer | Tech |
|---|---|
| Frontend | Astro 5 + React + TailwindCSS + wagmi/viem |
| Backend | Hono (Node.js/TypeScript) |
| Contracts | Solidity 0.8.28 + Foundry |
| Wallet | Safe Smart Account (ERC-4337) |
| AI Decision | Chainlink Functions + Qwen 2.5 72B |
| Automation | Chainlink Automation (6h upkeep) |
| Lending | Aave V3 + Morpho Blue (Base Sepolia) |

---

## Slide 5 — Workflow / Flowchart

### User Onboarding Flow

```
User connects wallet (EOA)
  ↓
Onboarding: isi risk tier, preferred assets, yield target
  ↓
LLM generate agent personality & instruction
  ↓
User confirm → AgentPolicy.setPolicy() on-chain
  ↓
Agent aktif — dashboard live
```

### Agent Execution Loop (Every 6 Hours)

```
Chainlink Automation → checkUpkeep()
  ↓ (condition met)
performUpkeep() → AutoYieldConsumer
  ↓
Chainlink Functions → call LLM (Qwen 2.5 72B)
  ↓
LLM returns JSON: { action, protocol, asset, amount, reason }
  ↓
Schema validation on-chain
  ↓
YieldOptimizerCore.executeManual()
  ↓
AgentPolicy validation (daily limit, risk tier, allowlist)
  ↓
AaveV3Adapter / MorphoAdapter → SUPPLY / WITHDRAW
  ↓
Safe Smart Account executes transaction
  ↓
Dashboard updated — user notified
```

### Deposit / Withdraw Flow

```
User input amount di Dashboard
  ↓
Frontend: ERC20.approve(AaveAdapter, amount)
  ↓
Backend: YieldOptimizerCore.executeManual(SUPPLY/WITHDRAW)
  ↓
Transaction confirmed → IndexedDB updated → UI refresh
```

---

## Slide 6 — Feasibility & Viability

### Technical Feasibility

- ✅ **Deployed & running** di Base Sepolia — bukan prototype, MVP fungsional end-to-end
- ✅ Chainlink Automation + Functions sudah GA dan production-ready
- ✅ Safe Smart Account adalah standar industri (>$100B TVL secured)
- ✅ Aave V3 + Morpho Blue tersedia di Base mainnet

### Market Viability

| Segment | Estimasi |
|---|---|
| DeFi TVL Global | ~$100B+ |
| Yield Farming Market (aktif) | ~$20B |
| Wallet aktif di Base | ~500K+ |
| SAM (user yang mau delegate yield) | ~5-10% = **$1-2B** |

### Business Model

- **Performance fee 10%** dari yield yang dihasilkan — user hanya bayar kalau profit (fully aligned)
- **Subscription premium** untuk fitur advanced: custom strategy, multi-chain, priority execution
- **B2B / DAO Treasury** — white-label agent untuk DAO yang butuh yield management otomatis

### Why Base

- TVL DeFi Base naik 10x dalam 12 bulan terakhir
- Coinbase distribution: 100M+ retail user sebagai potential funnel
- Gas murah → agent bisa rebalance lebih sering tanpa biaya prohibitif

---

## Slide 7 — Potential Risks & Mitigation Strategies

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Smart contract bug / exploit | Tinggi | Audit sebelum mainnet; Foundry fuzz testing; formal verification untuk core contracts |
| LLM output tidak valid / berbahaya | Tinggi | Schema validation on-chain sebelum eksekusi; output dibatasi ke whitelist action types |
| Chainlink Functions downtime | Medium | Cron fallback di backend; agent bisa pause otomatis jika upkeep gagal 3x berturut |
| Aave / Morpho protocol risk | Medium | Diversifikasi ke multiple protocol; daily limit mencegah overexposure |
| Regulatory uncertainty (DeFi AI) | Medium | Non-custodial by design; user selalu punya full control & kill switch |
| Private key backend compromise | Tinggi | Backend wallet hanya punya permission terbatas via AgentPolicy; tidak bisa drain user funds |
| Gas spike membuat rebalance tidak ekonomis | Low | Minimum profit threshold sebelum eksekusi; skip rebalance jika gas > expected yield |

---

## Slide 8 — Positive & Negative Impacts

### Positive Impacts

**Untuk User:**
- Akses ke yield optimization yang sebelumnya hanya tersedia untuk whale / institusi
- Tidak perlu keahlian teknis DeFi — cukup set instruksi natural language
- Tetap non-custodial — tidak ada counterparty risk ke platform

**Untuk Ekosistem DeFi:**
- Meningkatkan capital efficiency di protokol lending (Aave, Morpho)
- Mendorong adopsi Base L2 dari retail user
- Mempercepat maturitas DeFAI (AI + DeFi) sebagai kategori baru

**Untuk Industri:**
- Proof of concept bahwa LLM bisa diintegrasikan secara verifiable on-chain via Chainlink Functions
- Template arsitektur non-custodial AI agent yang bisa diadopsi protokol lain

### Negative Impacts & Mitigasi

**Risiko Konsentrasi Likuiditas:**
- Jika banyak agent serentak rebalance ke protokol yang sama → bisa distorsi APY
- Mitigasi: diversifikasi mandatory, cap per-protocol exposure

**Ketergantungan pada LLM:**
- Keputusan finansial bergantung pada model AI yang bisa hallucinate
- Mitigasi: LLM hanya sebagai advisor, eksekusi tetap divalidasi on-chain policy

**Barrier to Entry Berkurang:**
- User tanpa pemahaman DeFi bisa overexpose ke protokol berisiko
- Mitigasi: onboarding risk profiling wajib; default ke conservative tier

---

## Slide 9 — References

### Protokol & Infrastruktur

- Aave V3 Documentation — https://docs.aave.com/developers/
- Morpho Blue Documentation — https://docs.morpho.org/
- Chainlink Automation — https://docs.chain.link/chainlink-automation
- Chainlink Functions — https://docs.chain.link/chainlink-functions
- Safe Smart Account (ERC-4337) — https://docs.safe.global/

### Standar & Spesifikasi

- ERC-4337: Account Abstraction — https://eips.ethereum.org/EIPS/eip-4337
- ERC-20 Token Standard — https://eips.ethereum.org/EIPS/eip-20

### Data & Market

- DeFi Llama — TVL & Protocol Data — https://defillama.com/
- Base Ecosystem Stats — https://base.org/ecosystem
- Dune Analytics — Base DeFi Activity

### AI / LLM

- Qwen 2.5 72B (Alibaba DashScope) — https://dashscope.aliyuncs.com/
- OpenRouter API — https://openrouter.ai/

### Tech Stack

- Astro Framework — https://astro.build/
- wagmi / viem — https://wagmi.sh/ | https://viem.sh/
- Hono Web Framework — https://hono.dev/
- Foundry (Solidity testing) — https://book.getfoundry.sh/
- Dexie.js (IndexedDB) — https://dexie.org/

---

_Last updated: March 2026 | DeFAI YieldGuard — Base Ecosystem Hackathon_

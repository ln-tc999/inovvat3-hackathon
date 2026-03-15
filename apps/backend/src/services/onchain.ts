/**
 * On-chain service — interacts with deployed contracts via viem
 * Backend wallet signs and sends transactions to YieldOptimizerCore
 */
import {
  createPublicClient,
  createWalletClient,
  http,
  parseUnits,
  formatUnits,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// ── ABIs (minimal — only functions we call) ───────────────────────────────────

const YIELD_OPTIMIZER_ABI = [
  {
    name: "executeManual",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      {
        name: "actions",
        type: "tuple[]",
        components: [
          { name: "protocol", type: "address" },
          { name: "action",   type: "uint8"   }, // 0=SUPPLY, 1=WITHDRAW
          { name: "asset",    type: "address" },
          { name: "amount",   type: "uint256" },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: "getPortfolio",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user",     type: "address"   },
      { name: "assets",   type: "address[]" },
      { name: "adapters", type: "address[]" },
    ],
    outputs: [
      { name: "balances", type: "uint256[]" },
      { name: "apys",     type: "uint256[]" },
    ],
  },
  {
    name: "registeredAdapters",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "adapter", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

const ADAPTER_ABI = [
  {
    name: "getAPY",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getBalance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "asset", type: "address" },
      { name: "user",  type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ── Config ────────────────────────────────────────────────────────────────────

export const SUPPORTED_ASSETS: Record<string, { address: Address; decimals: number; symbol: string }> = {
  USDC: {
    address: "0xB26BDd8Ef3eE37128462A0611FAE71E75d2A8Ba3",
    decimals: 6,
    symbol: "USDC",
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    symbol: "WETH",
  },
};

const YIELD_OPTIMIZER_ADDRESS = (process.env.YIELD_OPTIMIZER_ADDRESS ?? "") as Address;
const AAVE_ADAPTER_ADDRESS    = (process.env.AAVE_ADAPTER_ADDRESS    ?? "") as Address;
const MORPHO_ADAPTER_ADDRESS  = (process.env.MORPHO_ADAPTER_ADDRESS  ?? "") as Address;
const RPC_URL                 = process.env.RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";
const BACKEND_PRIVATE_KEY     = process.env.BACKEND_PRIVATE_KEY as `0x${string}` | undefined;

// ── Clients ───────────────────────────────────────────────────────────────────

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

function getWalletClient() {
  const key = process.env.BACKEND_PRIVATE_KEY as `0x${string}` | undefined;
  if (!key) throw new Error("BACKEND_PRIVATE_KEY not set");
  const account = privateKeyToAccount(key);
  const rpc = process.env.RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";
  return createWalletClient({ account, chain: baseSepolia, transport: http(rpc) });
}

const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount",  type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner",   type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// ── Action types ──────────────────────────────────────────────────────────────
export const ActionType = { SUPPLY: 0, WITHDRAW: 1 } as const;

/**
 * Ensure backend wallet has approved the adapter to spend `amount` of `asset`
 */
async function ensureApproval(
  walletClient: ReturnType<typeof getWalletClient>,
  asset: Address,
  spender: Address,
  amount: bigint,
) {
  const owner = walletClient.account.address;
  const allowance = await publicClient.readContract({
    address: asset,
    abi: ERC20_APPROVE_ABI,
    functionName: "allowance",
    args: [owner, spender],
  }) as bigint;

  if (allowance < amount) {
    console.log(`[OnChain] Approving ${spender} for ${amount} of ${asset}`);
    const hash = await walletClient.writeContract({
      address: asset,
      abi: ERC20_APPROVE_ABI,
      functionName: "approve",
      args: [spender, amount * 10n], // approve 10x to avoid repeated approvals
    });
    await publicClient.waitForTransactionReceipt({ hash });
    console.log(`[OnChain] Approval confirmed: ${hash}`);
  }
}

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Execute a SUPPLY action on-chain for a user
 * Prerequisite: user must have approved the AaveV3Adapter to spend their tokens
 */
export async function executeSupply(
  userAddress: Address,
  asset: "USDC" | "WETH",
  amountHuman: number,
  protocol: "aave" | "morpho" = "aave",
): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  const assetInfo = SUPPORTED_ASSETS[asset];
  const amount = parseUnits(String(amountHuman), assetInfo.decimals);
  const aaveAdapter   = (process.env.AAVE_ADAPTER_ADDRESS   ?? "") as Address;
  const morphoAdapter = (process.env.MORPHO_ADAPTER_ADDRESS ?? "") as Address;
  const yieldOptimizer = (process.env.YIELD_OPTIMIZER_ADDRESS ?? "") as Address;
  const adapterAddress = protocol === "aave" ? aaveAdapter : morphoAdapter;

  await ensureApproval(walletClient, assetInfo.address, adapterAddress, amount);

  const hash = await walletClient.writeContract({
    address: yieldOptimizer,
    abi: YIELD_OPTIMIZER_ABI,
    functionName: "executeManual",
    args: [
      userAddress,
      [{ protocol: adapterAddress, action: ActionType.SUPPLY, asset: assetInfo.address, amount }],
    ],
  });

  console.log(`[OnChain] SUPPLY ${amountHuman} ${asset} for ${userAddress} → tx: ${hash}`);
  return hash;
}

/**
 * Execute a WITHDRAW action on-chain for a user
 */
export async function executeWithdraw(
  userAddress: Address,
  asset: "USDC" | "WETH",
  amountHuman: number,
  protocol: "aave" | "morpho" = "aave",
): Promise<`0x${string}`> {
  const walletClient = getWalletClient();
  const assetInfo = SUPPORTED_ASSETS[asset];
  const amount = parseUnits(String(amountHuman), assetInfo.decimals);
  const aaveAdapter   = (process.env.AAVE_ADAPTER_ADDRESS   ?? "") as Address;
  const morphoAdapter = (process.env.MORPHO_ADAPTER_ADDRESS ?? "") as Address;
  const yieldOptimizer = (process.env.YIELD_OPTIMIZER_ADDRESS ?? "") as Address;
  const adapterAddress = protocol === "aave" ? aaveAdapter : morphoAdapter;

  const hash = await walletClient.writeContract({
    address: yieldOptimizer,
    abi: YIELD_OPTIMIZER_ABI,
    functionName: "executeManual",
    args: [
      userAddress,
      [{ protocol: adapterAddress, action: ActionType.WITHDRAW, asset: assetInfo.address, amount }],
    ],
  });

  console.log(`[OnChain] WITHDRAW ${amountHuman} ${asset} for ${userAddress} → tx: ${hash}`);
  return hash;
}

/**
 * Get real on-chain portfolio balances and APYs for a user
 */
export async function getOnChainPortfolio(userAddress: Address) {
  const assets = Object.values(SUPPORTED_ASSETS).map((a) => a.address);
  const adapters = assets.map(() => AAVE_ADAPTER_ADDRESS); // check Aave for all assets

  try {
    const [balances, apys] = await publicClient.readContract({
      address: YIELD_OPTIMIZER_ADDRESS,
      abi: YIELD_OPTIMIZER_ABI,
      functionName: "getPortfolio",
      args: [userAddress, assets, adapters],
    }) as [bigint[], bigint[]];

    return Object.entries(SUPPORTED_ASSETS).map(([symbol, info], i) => ({
      symbol,
      asset: info.address,
      balanceRaw: balances[i],
      balance: Number(formatUnits(balances[i], info.decimals)),
      apyBps: Number(apys[i]),
    }));
  } catch (err) {
    console.error("[OnChain] getPortfolio error:", err);
    return [];
  }
}

/**
 * Check if backend wallet is configured
 * Read directly from process.env to avoid stale module-level captures
 */
export function isOnChainEnabled(): boolean {
  return !!(
    process.env.BACKEND_PRIVATE_KEY &&
    process.env.YIELD_OPTIMIZER_ADDRESS &&
    process.env.AAVE_ADAPTER_ADDRESS
  );
}

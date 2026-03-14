import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { AGENT_POLICY_ABI, YIELD_OPTIMIZER_CORE_ABI } from "@autoyield/shared";

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.RPC_URL_BASE_SEPOLIA),
});

export function getWalletClient() {
  const account = privateKeyToAccount(
    (process.env.AGENT_PRIVATE_KEY ?? "0x0") as `0x${string}`
  );
  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.RPC_URL_BASE_SEPOLIA),
  });
}

export async function getUserPolicy(userAddress: `0x${string}`) {
  return publicClient.readContract({
    address: process.env.AGENT_POLICY_ADDRESS as `0x${string}`,
    abi: AGENT_POLICY_ABI,
    functionName: "getPolicy",
    args: [userAddress],
  });
}

export async function getPortfolio(
  userAddress: `0x${string}`,
  assets: `0x${string}`[],
  adapters: `0x${string}`[]
) {
  return publicClient.readContract({
    address: process.env.YIELD_OPTIMIZER_ADDRESS as `0x${string}`,
    abi: YIELD_OPTIMIZER_CORE_ABI,
    functionName: "getPortfolio",
    args: [userAddress, assets, adapters],
  });
}

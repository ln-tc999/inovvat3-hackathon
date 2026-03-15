import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { apiClient } from "../../lib/api";
import { addTxHistory } from "../../lib/db";
import { ArrowDownToLine, ArrowUpFromLine, Loader2, ExternalLink } from "lucide-react";

// Token addresses on Base Sepolia
const TOKENS = {
  USDC: {
    address: "0xB26BDd8Ef3eE37128462A0611FAE71E75d2A8Ba3" as `0x${string}`,
    decimals: 6,
    symbol: "USDC",
  },
  WETH: {
    address: "0x4200000000000000000000000000000000000006" as `0x${string}`,
    decimals: 18,
    symbol: "WETH",
  },
} as const;

type TokenSymbol = keyof typeof TOKENS;
type TabType = "deposit" | "withdraw";

const ERC20_ABI = [
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

const AAVE_ADAPTER = (import.meta.env.PUBLIC_AAVE_ADAPTER_ADDRESS ?? "") as `0x${string}`;

export default function DepositCard() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [tab, setTab]           = useState<TabType>("deposit");
  const [asset, setAsset]       = useState<TokenSymbol>("USDC");
  const [amount, setAmount]     = useState("");
  const [status, setStatus]     = useState<"idle" | "approving" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash]     = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fauceting, setFauceting] = useState(false);

  const token = TOKENS[asset];
  const isLoading = status === "approving" || status === "pending";

  async function handleFaucet() {
    if (!address) return;
    setFauceting(true);
    try {
      const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/agent/faucet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: 1000 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Faucet failed");
      setStatus("success");
      setTxHash(data.txHash);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Faucet failed");
      setStatus("error");
    } finally {
      setFauceting(false);
    }
  }

  async function handleDeposit() {
    if (!address || !amount || Number(amount) <= 0) return;
    setStatus("approving");
    setErrorMsg(null);
    setTxHash(null);

    try {
      // Step 1: Approve AaveV3Adapter to spend tokens
      const amountWei = parseUnits(amount, token.decimals);
      const approveTx = await writeContractAsync({
        address: token.address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [AAVE_ADAPTER, amountWei],
      });
      console.log("[Deposit] Approve tx:", approveTx);

      // Step 2: Backend calls executeManual(SUPPLY)
      setStatus("pending");
      const res = await apiClient.deposit({
        userAddress: address,
        asset,
        amount: Number(amount),
        protocol: "aave",
      });

      setTxHash(res.txHash);
      setStatus("success");
      setAmount("");
      await addTxHistory({
        timestamp: Date.now(),
        type: "deposit",
        asset,
        amount: Number(amount),
        protocol: "aave",
        txHash: res.txHash,
        status: "success",
        userAddress: address.toLowerCase(),
      });
    } catch (err: any) {
      console.error("[Deposit] Error:", err);
      setErrorMsg(err?.message ?? "Transaction failed");
      setStatus("error");
    }
  }

  async function handleWithdraw() {
    if (!address || !amount || Number(amount) <= 0) return;
    setStatus("pending");
    setErrorMsg(null);
    setTxHash(null);

    try {
      const res = await apiClient.withdraw({
        userAddress: address,
        asset,
        amount: Number(amount),
        protocol: "aave",
      });

      setTxHash(res.txHash);
      setStatus("success");
      setAmount("");
      await addTxHistory({
        timestamp: Date.now(),
        type: "withdraw",
        asset,
        amount: Number(amount),
        protocol: "aave",
        txHash: res.txHash,
        status: "success",
        userAddress: address.toLowerCase(),
      });
    } catch (err: any) {
      console.error("[Withdraw] Error:", err);
      setErrorMsg(err?.message ?? "Transaction failed");
      setStatus("error");
    }
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 12,
      padding: 24,
    }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--surface-2)", borderRadius: 8, padding: 4 }}>
        {(["deposit", "withdraw"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setStatus("idle"); setErrorMsg(null); setTxHash(null); }}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 6, border: "none",
              background: tab === t ? "var(--bg)" : "transparent",
              color: tab === t ? "var(--text)" : "var(--muted)",
              fontWeight: tab === t ? 600 : 400,
              fontSize: 13, cursor: "pointer",
              boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.15s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {t === "deposit"
              ? <><ArrowDownToLine size={13} /> Deposit</>
              : <><ArrowUpFromLine size={13} /> Withdraw</>
            }
          </button>
        ))}
      </div>

      {/* Asset selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
          Asset
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {(Object.keys(TOKENS) as TokenSymbol[]).map((sym) => (
            <button
              key={sym}
              onClick={() => setAsset(sym)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 8,
                border: `1px solid ${asset === sym ? "var(--accent)" : "var(--border)"}`,
                background: asset === sym ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface-2)",
                color: asset === sym ? "var(--accent)" : "var(--muted)",
                fontWeight: asset === sym ? 600 : 400,
                fontSize: 14, cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>
          Amount
        </label>
        <div style={{ position: "relative" }}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="d-input"
            style={{ paddingRight: 60, fontSize: 16 }}
          />
          <span style={{
            position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 13, fontWeight: 600, color: "var(--muted)",
          }}>
            {asset}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{
        padding: "10px 14px", borderRadius: 8,
        background: "var(--surface-2)", border: "1px solid var(--border)",
        fontSize: 12, color: "var(--muted)", marginBottom: 16,
        lineHeight: 1.6,
      }}>
        {tab === "deposit"
          ? `Depositing will first approve AaveV3Adapter, then supply ${asset} to Aave V3 on Base Sepolia. You'll receive aTokens representing your position.`
          : `Withdrawing will redeem your aToken position and return ${asset} to your wallet.`
        }
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 12,
          background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
          border: "1px solid var(--danger)",
          fontSize: 13, color: "var(--danger)",
        }}>
          {errorMsg}
        </div>
      )}

      {/* Success */}
      {status === "success" && txHash && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, marginBottom: 12,
          background: "color-mix(in srgb, #22c55e 10%, var(--surface))",
          border: "1px solid #22c55e",
          fontSize: 13, color: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>Transaction confirmed</span>
          <a
            href={`https://sepolia.basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}
          >
            View <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={tab === "deposit" ? handleDeposit : handleWithdraw}
        disabled={isLoading || !amount || Number(amount) <= 0}
        className="d-btn d-btn-primary"
        style={{ width: "100%", justifyContent: "center", opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            {status === "approving" ? "Approving..." : "Submitting..."}
          </>
        ) : (
          tab === "deposit" ? `Deposit ${asset}` : `Withdraw ${asset}`
        )}
      </button>

      {/* Testnet faucet */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <p style={{ fontSize: 11, color: "var(--muted)", margin: 0 }}>
          Base Sepolia testnet
        </p>
        <button
          onClick={handleFaucet}
          disabled={fauceting || !address}
          style={{
            fontSize: 11, color: "var(--accent)", background: "none", border: "none",
            cursor: "pointer", padding: 0, opacity: fauceting ? 0.5 : 1,
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          {fauceting ? <Loader2 size={11} className="animate-spin" /> : null}
          Get 1000 test USDC
        </button>
      </div>
    </div>
  );
}

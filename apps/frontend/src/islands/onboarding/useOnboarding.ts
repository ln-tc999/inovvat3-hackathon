import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { keccak256, toBytes, parseUnits } from "viem";
import { saveRiskProfile, type RiskTier } from "../../lib/db";
import { apiClient, type GenerateProfileResponse } from "../../lib/api";

// AgentPolicy ABI — only setPolicy needed
const AGENT_POLICY_ABI = [
  {
    name: "setPolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "maxRisk",           type: "uint8"    },
      { name: "dailyLimit",        type: "uint256"  },
      { name: "sessionDuration",   type: "uint256"  },
      { name: "instructionHash",   type: "bytes32"  },
      { name: "allowedProtocols",  type: "address[]"},
    ],
    outputs: [],
  },
] as const;

const AGENT_POLICY_ADDRESS = (import.meta.env.PUBLIC_AGENT_POLICY_ADDRESS ?? "") as `0x${string}`;
const AAVE_ADAPTER   = (import.meta.env.PUBLIC_AAVE_ADAPTER_ADDRESS   ?? "") as `0x${string}`;
const MORPHO_ADAPTER = (import.meta.env.PUBLIC_MORPHO_ADAPTER_ADDRESS ?? "") as `0x${string}`;

export interface OnboardingFormData {
  userName:        string;
  riskTier:        RiskTier;
  preferredAssets: string[];
  timeHorizon:     "short" | "medium" | "long";
  yieldTarget:     number;
}

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export function useOnboarding() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep]               = useState<OnboardingStep>(1);
  const [formData, setFormData]       = useState<Partial<OnboardingFormData>>({});
  const [generatedProfile, setGenerated] = useState<GenerateProfileResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [txHash, setTxHash]           = useState<string | null>(null);

  function updateForm(data: Partial<OnboardingFormData>) {
    setFormData((prev) => ({ ...prev, ...data }));
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 6) as OnboardingStep);
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1) as OnboardingStep);
  }

  async function generateProfile(overrides?: Partial<OnboardingFormData>) {
    const data = { ...formData, ...overrides };
    // preferredAssets defaults to ["USDC"] if user never changed it in StepAssets
    const preferredAssets = data.preferredAssets?.length ? data.preferredAssets : ["USDC"];

    if (!data.riskTier || !data.timeHorizon || !data.yieldTarget) {
      console.warn("[Onboarding] generateProfile called with incomplete data:", data);
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const profile = await apiClient.generateProfile({
        riskTier:        data.riskTier,
        preferredAssets,
        timeHorizon:     data.timeHorizon,
        yieldTarget:     data.yieldTarget,
        walletAddress:   address,
      });
      setGenerated(profile);
      nextStep(); // go to confirm step
    } catch (e: any) {
      console.error("[Onboarding] generateProfile error:", e);
      setError(e?.message ?? "Failed to generate profile. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function confirmAndSave() {
    if (!generatedProfile || !address || !formData.riskTier) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Try on-chain write (optional — skip if no contract address configured)
      if (AGENT_POLICY_ADDRESS && AGENT_POLICY_ADDRESS !== "") {
        const instructionHash = keccak256(toBytes(generatedProfile.generatedInstruction));
        const dailyLimitWei   = parseUnits(String(generatedProfile.dailyLimitUSD), 18);
        const sessionDuration = BigInt(30 * 24 * 60 * 60); // 30 days

        const allowedProtocols: `0x${string}`[] = [];
        if (AAVE_ADAPTER)   allowedProtocols.push(AAVE_ADAPTER);
        if (MORPHO_ADAPTER) allowedProtocols.push(MORPHO_ADAPTER);

        const hash = await writeContractAsync({
          address: AGENT_POLICY_ADDRESS,
          abi: AGENT_POLICY_ABI,
          functionName: "setPolicy",
          args: [
            generatedProfile.maxRisk,
            dailyLimitWei,
            sessionDuration,
            instructionHash,
            allowedProtocols,
          ],
        });
        setTxHash(hash);
      }

      // 2. Save to IndexedDB (always)
      await saveRiskProfile({
        walletAddress:        address,
        userName:             formData.userName ?? "Anon",
        riskTier:             formData.riskTier!,
        maxRisk:              generatedProfile.maxRisk,
        dailyLimitUSD:        generatedProfile.dailyLimitUSD,
        preferredAssets:      formData.preferredAssets?.length ? formData.preferredAssets : ["USDC"],
        timeHorizon:          formData.timeHorizon ?? "medium",
        yieldTarget:          formData.yieldTarget ?? 5,
        agentName:            generatedProfile.agentName,
        generatedInstruction: generatedProfile.generatedInstruction,
        onboardingComplete:   true,
        createdAt:            Date.now(),
        updatedAt:            Date.now(),
      });

      // 3. Pre-set agent instruction via backend
      await apiClient.setInstruction({
        instruction:   generatedProfile.generatedInstruction,
        maxRisk:       generatedProfile.maxRisk,
        userAddress:   address,
      });

      nextStep(); // go to success step
    } catch (e: any) {
      // If on-chain fails (e.g. no wallet/testnet), still save locally
      if (e?.message?.includes("User rejected")) {
        setError("Transaction rejected. Profile saved locally only.");
      } else {
        // Save locally anyway
        await saveRiskProfile({
          walletAddress:        address,
          userName:             formData.userName ?? "Anon",
          riskTier:             formData.riskTier!,
          maxRisk:              generatedProfile.maxRisk,
          dailyLimitUSD:        generatedProfile.dailyLimitUSD,
          preferredAssets:      formData.preferredAssets?.length ? formData.preferredAssets : ["USDC"],
          timeHorizon:          formData.timeHorizon ?? "medium",
          yieldTarget:          formData.yieldTarget ?? 5,
          agentName:            generatedProfile.agentName,
          generatedInstruction: generatedProfile.generatedInstruction,
          onboardingComplete:   true,
          createdAt:            Date.now(),
          updatedAt:            Date.now(),
        });
        nextStep();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    step, formData, generatedProfile,
    isGenerating, isSubmitting, error, txHash,
    updateForm, nextStep, prevStep,
    generateProfile, confirmAndSave,
  };
}

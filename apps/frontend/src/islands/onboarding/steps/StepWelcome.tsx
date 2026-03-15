import { Zap, Shield, TrendingUp, User, AlertTriangle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState } from "react";

interface Props {
  name: string;
  onNameChange: (v: string) => void;
  onNext: () => void;
}

export default function StepWelcome({ name, onNameChange, onNext }: Props) {
  const { isConnected } = useAccount();
  const [touched, setTouched] = useState(false);
  const isValid = name.trim().length >= 2;
  const showError = touched && !isValid;

  return (
    <div className="flex flex-col items-center gap-7 text-center">
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: 16,
        background: "var(--accent)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <Zap size={32} color="#fff" />
      </div>

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Meet Your AI Yield Agent
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 10, lineHeight: 1.6, maxWidth: 420 }}>
          Answer 4 quick questions and we'll configure an AI agent that matches your risk profile and yield goals — automatically.
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { icon: Shield,      label: "Non-custodial" },
          { icon: TrendingUp,  label: "Up to 12% APY" },
          { icon: Zap,         label: "24/7 autonomous" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="d-badge d-badge-purple" style={{ padding: "6px 14px", fontSize: 13 }}>
            <Icon size={13} />
            {label}
          </div>
        ))}
      </div>

      {/* Name input */}
      <div style={{ width: "100%", maxWidth: 320, textAlign: "left" }}>
        <label htmlFor="user-name" style={{
          fontSize: 13, fontWeight: 600, color: "var(--muted)",
          display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          <User size={13} />
          What should we call you?
        </label>
        <input
          id="user-name"
          type="text"
          placeholder="e.g. Alex, or just your nickname"
          maxLength={40}
          className="d-input"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          style={{ textAlign: "left" }}
        />
        {showError && (
          <p role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} />
            Please enter at least 2 characters
          </p>
        )}
      </div>

      {/* Wallet connect or continue */}
      <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: 320 }}>
        {!isConnected ? (
          <>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Connect your wallet to get started</p>
            <ConnectButton label="Connect Wallet" showBalance={false} chainStatus="none" />
          </>
        ) : (
          <button
            onClick={() => { setTouched(true); if (isValid) onNext(); }}
            className="d-btn d-btn-primary"
            style={{ width: "100%", justifyContent: "center", height: 48, fontSize: 15 }}
          >
            Get Started
            <Zap size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

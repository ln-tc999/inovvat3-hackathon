// Internationalization-ready string constants
// Replace values here to localize the app

export const STRINGS = {
  // App
  appName: "DeFAI YieldGuard",
  tagline: "Your AI Agent that earns yield 24/7 while you sleep — anywhere in the world",

  // Landing
  heroSubtitle: "Non-custodial AI agent. Set your strategy once in plain English. Agent auto-optimizes yield across Aave & Morpho on Base — 24/7.",
  ctaConnect: "Connect Wallet & Start Earning",
  ctaLearnMore: "How it works",

  // Stats
  stat1Value: "Up to 12% APY",
  stat1Label: "on stablecoins",
  stat2Value: "0 gas worries",
  stat2Label: "on Base chain",
  stat3Value: "Non-custodial",
  stat3Label: "you keep control",
  stat4Value: "24/7 autonomous",
  stat4Label: "AI-powered agent",

  // Features
  feature1Title: "Natural Language Setup",
  feature1Desc: "Tell your agent what to do in plain English. No DeFi expertise needed.",
  feature2Title: "Auto-Optimize Yield",
  feature2Desc: "Agent monitors Aave & Morpho every 6 hours and rebalances for best APY.",
  feature3Title: "Always Non-Custodial",
  feature3Desc: "Your funds stay in your Safe wallet. Agent has limited, revocable permissions.",

  // Dashboard
  dashboardTitle: "Dashboard",
  portfolioSection: "Current Portfolio",
  agentControlsSection: "Agent Controls",
  performanceSection: "Performance",

  // Agent chat
  chatPlaceholder: "Tell your agent what to do... e.g. \"Maximize yield with low risk on stablecoins only\"",
  chatSuggestion1: "Maximize yield with low risk on stablecoins only",
  chatSuggestion2: "Compound every 6 hours, risk < 5%",
  chatSuggestion3: "Rebalance weekly, preserve principal",
  updateInstruction: "Update Instruction",
  pauseAgent: "Pause Agent",
  resumeAgent: "Resume Agent",
  killSwitch: "Kill Switch",
  killSwitchConfirm: "Are you sure? This will stop the agent immediately.",

  // Status
  statusActive: "Active",
  statusPaused: "Paused",
  connecting: "Connecting to Base...",
  agentPaused: "Agent paused",

  // Errors
  errorConnect: "Failed to connect wallet",
  errorFetch: "Failed to fetch data",
  errorInstruction: "Failed to update instruction",
} as const;

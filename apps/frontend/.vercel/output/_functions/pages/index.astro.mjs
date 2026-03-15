/* empty css                                   */
import { e as createComponent, m as maybeRenderHead, k as renderComponent, r as renderTemplate, u as unescapeHTML } from '../chunks/astro/server_BSg5bIr_.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_Ci2xpOI8.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { LayoutDashboard, Sun, Moon } from 'lucide-react';
import { u as useTheme, W as WagmiProvider } from '../chunks/useTheme_Bx62c_5d.mjs';
import { clsx } from 'clsx';
import React, { useRef, useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { IconX, IconMenu2 } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'motion/react';
export { renderers } from '../renderers.mjs';

function WalletConnectInner({ variant = "header", redirectToDashboard = false }) {
  const { isConnected } = useAccount();
  if (isConnected && variant === "hero" && redirectToDashboard) {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    isConnected && /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/dashboard",
        className: "btn-fill-up inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold",
        style: { background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" },
        children: [
          /* @__PURE__ */ jsx(LayoutDashboard, { size: 15 }),
          "Dashboard"
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      ConnectButton,
      {
        label: variant === "hero" ? "Connect Wallet & Start Earning" : "Connect Wallet",
        showBalance: false,
        chainStatus: "none",
        accountStatus: "avatar"
      }
    )
  ] });
}
function WalletConnect(props) {
  const { isDark } = useTheme();
  return /* @__PURE__ */ jsx(WagmiProvider, { isDark, children: /* @__PURE__ */ jsx(WalletConnectInner, { ...props }) });
}

const $$HeroSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="hero" class="lp-section relative min-h-screen flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 pt-20"> <!-- badge --> <div class="lp-badge inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium mb-6 sm:mb-8"> <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--accent);"></span> <span style="color: var(--accent);">Live on Base Sepolia Testnet</span> </div> <!-- headline --> <h1 class="lp-text font-black max-w-4xl mx-auto leading-[1.05] tracking-tight" style="font-size: clamp(2.25rem, 6vw, 5rem);">
The Premier AI Yield Agent<br> <span class="lp-accent">for DeFi on Base</span> </h1> <p class="lp-muted mt-5 sm:mt-6 max-w-xl mx-auto leading-relaxed" style="font-size: clamp(0.95rem, 1.5vw, 1.125rem);">
Non-custodial AI agent. Set your strategy once in plain English.
    Agent auto-optimizes yield across Aave &amp; Morpho — 24/7.
</p> <!-- CTAs --> <div class="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"> ${renderComponent($$result, "WalletConnect", WalletConnect, { "client:load": true, "variant": "hero", "redirectToDashboard": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/WalletConnect", "client:component-export": "default" })} <a href="#about" class="btn-fill-up lp-badge px-6 py-3 text-sm font-medium">
Learn more
</a> </div> <!-- stats --> <div class="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mx-auto pb-10"> ${[
    { value: "Up to 12%", label: "APY on stablecoins" },
    { value: "6h", label: "Auto-rebalance cycle" },
    { value: "Non-custodial", label: "You keep control" },
    { value: "24/7", label: "Autonomous AI agent" }
  ].map((s) => renderTemplate`<div class="lp-card px-3 sm:px-4 py-4 sm:py-5 text-center"> <p class="lp-accent font-bold" style="font-size: clamp(0.95rem, 2vw, 1.25rem);">${s.value}</p> <p class="lp-muted text-xs mt-1">${s.label}</p> </div>`)} </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/HeroSection.astro", void 0);

const $$AboutSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="about" class="lp-section lp-divider border-t min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"> <div class="max-w-5xl mx-auto w-full"> <div class="text-center mb-10 sm:mb-14"> <p class="lp-muted text-xs uppercase tracking-widest mb-4">About</p> <h2 class="lp-text font-black leading-tight" style="font-size: clamp(1.75rem, 4vw, 2.75rem);">
Yield Optimization With YieldGuard Isn't<br> <span class="lp-accent">Passive. It's Autonomous.</span> </h2> <p class="lp-muted mt-5 max-w-2xl mx-auto leading-relaxed" style="font-size: clamp(0.875rem, 1.25vw, 1rem);">
Most DeFi users leave money on the table — APYs shift hourly across protocols.
        YieldGuard's AI agent monitors, decides, and executes rebalances on-chain
        while you do literally anything else.
</p> </div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5"> ${[
    { value: "6h", label: "Rebalance interval", sub: "Chainlink Automation" },
    { value: "<9s", label: "LLM decision time", sub: "Chainlink Functions" },
    { value: "2", label: "Protocols supported", sub: "Aave V3 + Morpho Blue" },
    { value: "100%", label: "Non-custodial", sub: "Safe Smart Account" }
  ].map((m) => renderTemplate`<div class="lp-card p-5 sm:p-6"> <p class="lp-text font-black" style="font-size: clamp(1.75rem, 4vw, 2.5rem);">${m.value}</p> <p class="lp-text text-sm mt-2 font-medium" style="opacity: 0.7;">${m.label}</p> <p class="lp-muted text-xs mt-1">${m.sub}</p> </div>`)} </div> </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/AboutSection.astro", void 0);

const $$FeaturesSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="features" class="lp-section lp-divider border-t min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"> <div class="max-w-5xl mx-auto w-full"> <div class="text-center mb-10 sm:mb-14"> <p class="lp-muted text-xs uppercase tracking-widest mb-4">Features</p> <h2 class="lp-text font-black leading-tight" style="font-size: clamp(1.75rem, 4vw, 2.75rem);">
Everything You Need.<br> <span class="lp-accent">Nothing You Don't.</span> </h2> </div> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"> ${[
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      title: "Natural Language Control",
      desc: "Set your strategy in plain English. No DeFi jargon, no complex UI. Just tell the agent what you want."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
      title: "AI-Powered Decisions",
      desc: "Qwen 2.5 72B analyzes live pool data every 6 hours via Chainlink Functions \u2014 verifiable, on-chain, tamper-proof."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      title: "Auto-Rebalance",
      desc: "Agent automatically migrates funds between Aave V3 and Morpho Blue to chase the best available APY."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      title: "Non-Custodial by Design",
      desc: "Your funds live in your Safe Smart Account. The agent only has a limited, revocable module permission \u2014 never your keys."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      title: "Kill Switch",
      desc: "Pause or stop the agent instantly from the dashboard. Session keys auto-expire in 30 days regardless."
    },
    {
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      title: "On-Chain Policy Validation",
      desc: "Every action is validated against your policy \u2014 daily limits, asset allowlist, and risk tier \u2014 before execution."
    }
  ].map((f) => renderTemplate`<div class="lp-card p-5 sm:p-6 flex flex-col gap-4"> <div class="lp-icon-box lp-muted w-9 h-9 flex items-center justify-center shrink-0">${unescapeHTML(f.icon)}</div> <h3 class="lp-text font-bold text-sm sm:text-base">${f.title}</h3> <p class="lp-muted text-sm leading-relaxed">${f.desc}</p> </div>`)} </div> </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/FeaturesSection.astro", void 0);

const $$HowItWorksSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="how-it-works" class="lp-section lp-divider border-t min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"> <div class="max-w-5xl mx-auto w-full"> <div class="text-center mb-10 sm:mb-14"> <p class="lp-muted text-xs uppercase tracking-widest mb-4">How it works</p> <h2 class="lp-text font-black leading-tight" style="font-size: clamp(1.75rem, 4vw, 2.75rem);">
Three Steps to<br> <span class="lp-accent">Autonomous Yield</span> </h2> </div> <!-- steps --> <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8"> ${[
    {
      step: "01",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
      title: "Connect & Instruct",
      desc: "Connect your wallet, deploy a Safe Smart Account in one click, then type your strategy in plain English.",
      tag: "ERC-4337 Safe Wallet"
    },
    {
      step: "02",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M20 15h2M2 9h2M20 9h2M9 2v2M9 20v2"/></svg>`,
      title: "AI Decides On-Chain",
      desc: "Every 6 hours, Chainlink Automation triggers an LLM call via Chainlink Functions. The AI analyzes live pool data and outputs a verified JSON decision.",
      tag: "Chainlink Functions + Qwen 2.5"
    },
    {
      step: "03",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`,
      title: "Execute & Earn",
      desc: "Agent executes the rebalance via your Safe module. Funds move between Aave and Morpho automatically. You just watch the yield grow.",
      tag: "Aave V3 + Morpho Blue"
    }
  ].map((item) => renderTemplate`<div class="lp-card relative p-5 sm:p-7 flex flex-col gap-4"> <span class="lp-text absolute top-4 right-5 font-black select-none leading-none" style="font-size: clamp(2.5rem, 5vw, 3.5rem); opacity: 0.05;"> ${item.step} </span> <div class="lp-icon-box lp-muted w-10 h-10 flex items-center justify-center shrink-0">${unescapeHTML(item.icon)}</div> <h3 class="lp-text font-bold text-base sm:text-lg">${item.title}</h3> <p class="lp-muted text-sm leading-relaxed flex-1">${item.desc}</p> <span class="lp-tag self-start">${item.tag}</span> </div>`)} </div> <!-- architecture flow --> <div class="lp-card p-5 sm:p-8"> <p class="lp-muted text-xs uppercase tracking-widest mb-5 text-center">Architecture</p> <div class="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 flex-wrap"> ${[
    "User EOA Wallet",
    "Safe Smart Account",
    "YieldOptimizerCore",
    "Chainlink Automation",
    "Chainlink Functions (LLM)",
    "Aave V3 / Morpho Blue"
  ].map((node, i, arr) => renderTemplate`<div class="flex items-center gap-2 sm:gap-3"> <span class="lp-tag">${node}</span> ${i < arr.length - 1 && renderTemplate`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lp-muted shrink-0 hidden sm:block opacity-40"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>`} </div>`)} </div> </div> </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/HowItWorksSection.astro", void 0);

const $$FaqSection = createComponent(($$result, $$props, $$slots) => {
  const faqs = [
    {
      q: "Is my money safe? Who controls my funds?",
      a: "You do. Your funds live in your own Safe Smart Account \u2014 a battle-tested ERC-4337 smart wallet. The agent only has a limited module permission to execute pre-approved actions. You can revoke it or hit the kill switch at any time."
    },
    {
      q: "What happens if the AI makes a bad decision?",
      a: "Every LLM output is schema-validated before execution. On top of that, your AgentPolicy contract enforces daily limits, an asset allowlist, and a risk tier cap on-chain. The agent literally cannot exceed your defined boundaries."
    },
    {
      q: "Which assets and protocols are supported?",
      a: "Currently USDC and DAI on Aave V3 and Morpho Blue, both on Base. More assets and protocols are on the roadmap for mainnet launch."
    },
    {
      q: "How often does the agent rebalance?",
      a: "Every 6 hours, triggered automatically by Chainlink Automation. The agent only moves funds if the APY difference justifies the gas cost \u2014 it won't rebalance for marginal gains."
    },
    {
      q: "Do I need to know DeFi to use this?",
      a: 'No. You just type what you want \u2014 e.g. "Maximize yield, keep risk below 5" \u2014 and the agent handles everything. No protocol knowledge required.'
    },
    {
      q: "Is this audited? Is it production-ready?",
      a: "This is currently a hackathon MVP running on Base Sepolia testnet. Smart contract audit is planned before mainnet launch. Do not use with real funds until the audit is complete."
    }
  ];
  return renderTemplate`${maybeRenderHead()}<section id="faq" class="lp-section lp-divider border-t min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"> <div class="max-w-3xl mx-auto w-full"> <div class="text-center mb-10 sm:mb-12"> <p class="lp-muted text-xs uppercase tracking-widest mb-4">FAQ</p> <h2 class="lp-text font-black" style="font-size: clamp(1.75rem, 4vw, 2.75rem);">
Common Questions
</h2> </div> <div class="flex flex-col gap-2 sm:gap-3"> ${faqs.map((faq) => renderTemplate`<details class="lp-card group overflow-hidden"> <summary class="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 cursor-pointer list-none select-none transition-colors" style="hover:background: var(--surface-2);"> <span class="lp-text font-medium text-sm pr-4">${faq.q}</span> <svg class="shrink-0 w-4 h-4 lp-muted transition-transform duration-200 group-open:rotate-45" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> <path d="M5 12h14"></path><path d="M12 5v14"></path> </svg> </summary> <div class="px-5 sm:px-6 pb-4 sm:pb-5"> <p class="lp-muted text-sm leading-relaxed">${faq.a}</p> </div> </details>`)} </div> </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/FaqSection.astro", void 0);

const $$CtaSection = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<section id="cta" class="lp-section lp-divider border-t min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20"> <div class="max-w-3xl mx-auto w-full text-center"> <p class="lp-muted text-xs uppercase tracking-widest mb-5 sm:mb-6">Get started</p> <h2 class="lp-text font-black mb-5 sm:mb-6 leading-tight" style="font-size: clamp(2rem, 5vw, 3.5rem);">
Where DeFi Yield and<br> <span class="lp-accent">AI Agents Connect</span> </h2> <p class="lp-muted mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed" style="font-size: clamp(0.875rem, 1.25vw, 1rem);">
Connect your wallet, set your strategy in plain English, and let the agent work.
      No DeFi expertise required.
</p> <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"> ${renderComponent($$result, "WalletConnect", WalletConnect, { "client:load": true, "variant": "hero", "redirectToDashboard": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/WalletConnect", "client:component-export": "default" })} <a href="/dashboard" class="btn-fill-up lp-badge px-6 py-3 text-sm font-medium">
Open Dashboard
</a> </div> <!-- ecosystem pills --> <div class="mt-12 sm:mt-14 flex flex-wrap items-center justify-center gap-2 sm:gap-3"> ${["Aave V3", "Morpho Blue", "Chainlink Functions", "Chainlink Automation", "Safe Wallet", "Base Chain"].map((name) => renderTemplate`<span class="lp-tag">${name}</span>`)} </div> </div> </section>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/sections/CtaSection.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="lp-section lp-divider border-t py-10 px-6"> <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm"> <div class="flex items-center gap-2"> <span class="lp-text font-black text-lg">DeFAI</span> <span class="lp-accent font-black text-lg">YieldGuard</span> <span class="lp-muted ml-2">— Hackathon MVP 2026</span> </div> <div class="flex items-center gap-6 lp-muted"> <a href="https://base.org" target="_blank" rel="noopener" class="lp-muted hover:lp-text transition-colors" style="text-decoration:none;">
Built on Base
</a> <a href="https://chain.link" target="_blank" rel="noopener" class="lp-muted hover:lp-text transition-colors" style="text-decoration:none;">
Powered by Chainlink
</a> <a href="https://safe.global" target="_blank" rel="noopener" class="lp-muted hover:lp-text transition-colors" style="text-decoration:none;">
Safe Wallet
</a> </div> </div> </footer>`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/components/Footer.astro", void 0);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const lerp = (from, to, progress) => from + (to - from) * progress;
const Navbar = ({ children, className }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const container = document.getElementById("scroll-container") ?? window;
    const getY = () => container instanceof Window ? container.scrollY : container.scrollTop;
    let rafId = null;
    const updateFromScroll = () => {
      const y = getY();
      const progress = clamp01(y / 120);
      setScrollProgress(progress);
      setVisible(progress > 0.04);
      rafId = null;
    };
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(updateFromScroll);
    };
    updateFromScroll();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      ref,
      className: cn("fixed inset-x-0 top-0 z-50 w-full", className),
      children: React.Children.map(
        children,
        (child) => React.isValidElement(child) ? React.cloneElement(
          child,
          { visible, scrollProgress }
        ) : child
      )
    }
  );
};
const NavBody = ({
  children,
  className,
  visible,
  scrollProgress = 0
}) => {
  const progress = clamp01(scrollProgress);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: {
        width: `${lerp(100, 65, progress)}%`,
        y: lerp(0, 10, progress),
        borderRadius: `${lerp(0, 8, progress)}px`,
        paddingLeft: `${lerp(24, 20, progress)}px`,
        paddingRight: `${lerp(24, 20, progress)}px`
      },
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      style: {
        minWidth: "720px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: visible ? "var(--border)" : "transparent",
        backgroundColor: visible ? "var(--nav)" : "transparent"
      },
      className: cn(
        "relative z-[60] mx-auto hidden max-w-6xl flex-row items-center justify-between self-start py-3 lg:flex",
        className
      ),
      children
    }
  );
};
const NavItems = ({ items, className, onItemClick }) => {
  const [hovered, setHovered] = useState(null);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      onMouseLeave: () => setHovered(null),
      className: cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex pointer-events-none",
        className
      ),
      children: items.map((item, idx) => /* @__PURE__ */ jsxs(
        "a",
        {
          onMouseEnter: () => setHovered(idx),
          onClick: onItemClick,
          className: "relative px-4 py-2 transition-colors pointer-events-auto",
          style: { color: "var(--muted)" },
          href: item.link,
          onMouseEnterCapture: (e) => {
            e.currentTarget.style.color = "var(--text)";
          },
          onMouseLeaveCapture: (e) => {
            e.currentTarget.style.color = "var(--muted)";
          },
          children: [
            hovered === idx && /* @__PURE__ */ jsx(
              motion.div,
              {
                layoutId: "hovered",
                className: "absolute inset-0 h-full w-full rounded-lg",
                style: { background: "var(--surface-2)" }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "relative z-20", children: item.name })
          ]
        },
        `link-${idx}`
      ))
    }
  );
};
const MobileNav = ({
  children,
  className,
  visible,
  scrollProgress = 0
}) => {
  const progress = clamp01(scrollProgress);
  return /* @__PURE__ */ jsx(
    motion.div,
    {
      animate: {
        borderRadius: `${lerp(0, 8, progress)}px`,
        width: `${lerp(100, 92, progress)}%`,
        y: lerp(0, 10, progress)
      },
      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      style: {
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: visible ? "var(--border)" : "transparent",
        backgroundColor: visible ? "var(--nav)" : "transparent"
      },
      className: cn(
        "relative z-50 mx-auto flex w-full flex-col items-center justify-between px-4 py-3 lg:hidden",
        className
      ),
      children
    }
  );
};
const MobileNavHeader = ({
  children,
  className
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex w-full flex-row items-center justify-between",
      className
    ),
    children
  }
);
const MobileNavMenu = ({
  children,
  className,
  isOpen
}) => /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsx(
  motion.div,
  {
    initial: { opacity: 0, y: -8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    className: cn(
      "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start gap-4 rounded-xl px-6 py-6",
      className
    ),
    style: {
      background: "var(--nav)",
      border: "1px solid var(--border)"
    },
    children
  }
) });
const MobileNavToggle = ({
  isOpen,
  onClick
}) => isOpen ? /* @__PURE__ */ jsx(
  IconX,
  {
    style: { color: "var(--text)" },
    className: "cursor-pointer",
    onClick
  }
) : /* @__PURE__ */ jsx(
  IconMenu2,
  {
    style: { color: "var(--text)" },
    className: "cursor-pointer",
    onClick
  }
);
const NavbarLogo = () => /* @__PURE__ */ jsxs(
  "a",
  {
    href: "/",
    className: "relative z-20 flex items-center gap-2 px-2 py-1",
    style: { textDecoration: "none" },
    children: [
      /* @__PURE__ */ jsx("span", { style: { fontWeight: 900, fontSize: 17, color: "var(--text)" }, children: "DeFAI" }),
      /* @__PURE__ */ jsx("span", { style: { fontWeight: 900, fontSize: 17, color: "var(--accent)" }, children: "YieldGuard" })
    ]
  }
);
const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}) => {
  const base = "px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 btn-fill-up";
  const styles = {
    primary: {
      background: "var(--surface-2)",
      color: "var(--text)",
      border: "1px solid var(--accent)"
    },
    secondary: {
      background: "var(--surface-2)",
      color: "var(--text)",
      border: "1px solid var(--border)"
    },
    dark: {
      background: "var(--surface-2)",
      color: "var(--text)",
      border: "1px solid var(--border)"
    },
    gradient: {
      background: "var(--surface-2)",
      color: "var(--text)",
      border: "1px solid var(--accent)"
    }
  };
  return /* @__PURE__ */ jsx(
    Tag,
    {
      href: href || void 0,
      className: cn(base, className),
      style: styles[variant],
      "data-variant": variant,
      ...props,
      children
    }
  );
};

const navItems = [
  { name: "About", link: "#about" },
  { name: "Features", link: "#features" },
  { name: "How it works", link: "#how-it-works" },
  { name: "FAQ", link: "#faq" }
];
function ThemeBtn({ isDark, toggle }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggle,
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      className: "btn-fill-up",
      style: {
        width: 36,
        height: 36,
        borderRadius: 8,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        flexShrink: 0
      },
      children: isDark ? /* @__PURE__ */ jsx(Sun, { size: 15 }) : /* @__PURE__ */ jsx(Moon, { size: 15 })
    }
  );
}
function SiteNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  return /* @__PURE__ */ jsxs(Navbar, { children: [
    /* @__PURE__ */ jsxs(NavBody, { children: [
      /* @__PURE__ */ jsx(NavbarLogo, {}),
      /* @__PURE__ */ jsx(NavItems, { items: navItems }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(ThemeBtn, { isDark, toggle }),
        /* @__PURE__ */ jsx(NavbarButton, { variant: "secondary", href: "/dashboard", children: "Dashboard" }),
        /* @__PURE__ */ jsx(WalletConnect, { variant: "header", redirectToDashboard: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(MobileNav, { children: [
      /* @__PURE__ */ jsxs(MobileNavHeader, { children: [
        /* @__PURE__ */ jsx(NavbarLogo, {}),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(ThemeBtn, { isDark, toggle }),
          /* @__PURE__ */ jsx(
            MobileNavToggle,
            {
              isOpen: isMobileMenuOpen,
              onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen)
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(MobileNavMenu, { isOpen: isMobileMenuOpen, onClose: () => setIsMobileMenuOpen(false), children: [
        navItems.map((item, idx) => /* @__PURE__ */ jsx(
          "a",
          {
            href: item.link,
            onClick: () => setIsMobileMenuOpen(false),
            className: "text-sm font-medium transition-colors w-full py-1",
            style: { color: "var(--muted)" },
            children: item.name
          },
          `mobile-link-${idx}`
        )),
        /* @__PURE__ */ jsxs("div", { className: "flex w-full flex-col gap-3 pt-3", style: { borderTop: "1px solid var(--border)" }, children: [
          /* @__PURE__ */ jsx(
            NavbarButton,
            {
              variant: "secondary",
              href: "/dashboard",
              className: "w-full",
              onClick: () => setIsMobileMenuOpen(false),
              children: "Dashboard"
            }
          ),
          /* @__PURE__ */ jsx(WalletConnect, { variant: "hero", redirectToDashboard: true })
        ] })
      ] })
    ] })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "SiteNavbar", SiteNavbar, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/SiteNavbar", "client:component-export": "default" })} ${maybeRenderHead()}<main id="scroll-container" class="overflow-x-hidden overflow-y-scroll" style="height: 100vh; scroll-snap-type: y mandatory;"> <div style="scroll-snap-align: start;">${renderComponent($$result2, "HeroSection", $$HeroSection, {})}</div> <div style="scroll-snap-align: start;">${renderComponent($$result2, "AboutSection", $$AboutSection, {})}</div> <div style="scroll-snap-align: start;">${renderComponent($$result2, "FeaturesSection", $$FeaturesSection, {})}</div> <div style="scroll-snap-align: start;">${renderComponent($$result2, "HowItWorksSection", $$HowItWorksSection, {})}</div> <div style="scroll-snap-align: start;">${renderComponent($$result2, "FaqSection", $$FaqSection, {})}</div> <div style="scroll-snap-align: start;">${renderComponent($$result2, "CtaSection", $$CtaSection, {})}</div> <!-- Footer snap section --> <div style="scroll-snap-align: start; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;"> <div class="lp-section flex-1 flex items-center justify-center overflow-hidden"> <p class="font-black leading-none tracking-tighter select-none lp-muted" style="font-size: clamp(3rem, 14vw, 11rem); opacity: 0.08;">
YIELDGUARD
</p> </div> ${renderComponent($$result2, "Footer", $$Footer, {})} </div> </main> ` })}`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/index.astro", void 0);

const $$file = "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

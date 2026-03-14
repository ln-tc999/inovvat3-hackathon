import { WagmiProvider } from "./WagmiProvider";
import { ConnectButton } from "./ConnectButton";
import { AgentChat } from "./AgentChat";
import { Dashboard } from "./Dashboard";

export function App() {
  return (
    <WagmiProvider>
      <div className="min-h-screen bg-dark-900 text-white">
        {/* Header */}
        <header className="border-b border-dark-700 px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-brand-400 font-bold text-lg">DeFAI</span>
            <span className="text-white font-bold text-lg"> YieldGuard</span>
            <p className="text-gray-500 text-xs mt-0.5">Your AI agent earns yield 24/7 while you sleep</p>
          </div>
          <ConnectButton />
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
          {/* Dashboard */}
          <section>
            <Dashboard />
          </section>

          {/* Agent Configuration */}
          <section className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Configure Agent</h2>
              <p className="text-gray-500 text-sm">
                Tell your agent what to do in plain English — it runs autonomously every 6 hours.
              </p>
            </div>
            <AgentChat />
          </section>

          {/* How it works */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              { step: "1", title: "Connect & Deploy Safe", desc: "1-click Safe smart account with limited agent permissions" },
              { step: "2", title: "Set Your Strategy", desc: "Natural language instruction — once. Agent handles the rest." },
              { step: "3", title: "Earn 24/7", desc: "Chainlink Automation + LLM rebalances every 6h for max yield" },
            ].map((item) => (
              <div key={item.step} className="bg-dark-800 border border-dark-600 rounded-2xl p-5 space-y-2">
                <span className="text-brand-400 font-bold text-2xl">{item.step}</span>
                <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </WagmiProvider>
  );
}

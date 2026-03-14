import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 font-mono">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm rounded-lg border border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors"
    >
      Connect Wallet
    </button>
  );
}

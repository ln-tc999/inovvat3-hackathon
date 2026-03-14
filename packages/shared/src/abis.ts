export const AGENT_POLICY_ABI = [
  {
    "inputs": [
      { "name": "maxRisk", "type": "uint8" },
      { "name": "dailyLimit", "type": "uint256" },
      { "name": "sessionDuration", "type": "uint256" },
      { "name": "instructionHash", "type": "bytes32" },
      { "name": "allowedProtocols", "type": "address[]" }
    ],
    "name": "setPolicy",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pauseAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resumeAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "user", "type": "address" }],
    "name": "getPolicy",
    "outputs": [
      {
        "components": [
          { "name": "maxRisk", "type": "uint8" },
          { "name": "dailyLimit", "type": "uint256" },
          { "name": "sessionExpiry", "type": "uint256" },
          { "name": "instructionHash", "type": "bytes32" },
          { "name": "active", "type": "bool" }
        ],
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "user", "type": "address" }],
    "name": "AgentPaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "name": "user", "type": "address" }],
    "name": "AgentResumed",
    "type": "event"
  }
] as const;

export const YIELD_OPTIMIZER_CORE_ABI = [
  {
    "inputs": [
      { "name": "user", "type": "address" },
      {
        "components": [
          { "name": "protocol", "type": "address" },
          { "name": "action", "type": "uint8" },
          { "name": "asset", "type": "address" },
          { "name": "amount", "type": "uint256" }
        ],
        "name": "actions",
        "type": "tuple[]"
      }
    ],
    "name": "executeBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "user", "type": "address" },
      { "name": "assets", "type": "address[]" },
      { "name": "adapters", "type": "address[]" }
    ],
    "name": "getPortfolio",
    "outputs": [
      { "name": "balances", "type": "uint256[]" },
      { "name": "apys", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "user", "type": "address" },
      { "indexed": false, "name": "actionsCount", "type": "uint256" }
    ],
    "name": "ActionsExecuted",
    "type": "event"
  }
] as const;

export const SAFE_AGENT_MODULE_ABI = [
  {
    "inputs": [{ "name": "safe", "type": "address" }],
    "name": "enableModule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "safe", "type": "address" }],
    "name": "disableModule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// Chainlink Functions JS source — runs in DON sandbox
// args: [userInstruction, balancesJSON, poolsJSON, maxRisk]
// Returns: ABI-encoded YieldAction[]

const [userInstruction, balancesJSON, poolsJSON, maxRisk] = args;

const balances = JSON.parse(balancesJSON);
const pools = JSON.parse(poolsJSON);

const prompt = `You are an elite DeFi yield optimizer agent on Base blockchain.
User instruction: ${userInstruction}
Current holdings: ${JSON.stringify(balances)}
Available pools: ${JSON.stringify(pools)}
Max risk: ${maxRisk || 5}

Output ONLY valid JSON:
{"actions":[{"protocol":"<address>","action":"SUPPLY|WITHDRAW","asset":"<address>","amount":"<wei_or_0>"}],"reason":"<brief>"}`;

const response = await Functions.makeHttpRequest({
  url: "https://openrouter.ai/api/v1/chat/completions",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${secrets.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
  data: {
    model: "qwen/qwen-2.5-72b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 512,
  },
  timeout: 9000,
});

if (response.error) throw new Error("LLM request failed");

const content = response.data.choices[0].message.content
  .replace(/```json?\n?/g, "")
  .replace(/```/g, "")
  .trim();

const decision = JSON.parse(content);

// Encode actions as bytes for on-chain fulfillment
// ActionType enum: SUPPLY=0, WITHDRAW=1, REBALANCE=2
const actionTypeMap = { SUPPLY: 0, WITHDRAW: 1, REBALANCE: 2 };

const encoded = decision.actions.map((a) => ({
  protocol: a.protocol,
  action: actionTypeMap[a.action] ?? 0,
  asset: a.asset,
  amount: BigInt(a.amount || "0"),
}));

// Return JSON string — backend decodes and ABI-encodes for contract
return Functions.encodeString(JSON.stringify(encoded));

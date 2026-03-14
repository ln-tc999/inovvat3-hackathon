const BASE_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";

export async function submitInstruction(userAddress: string, instruction: string, maxRisk?: number) {
  const res = await fetch(`${BASE_URL}/api/agent/instruct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userAddress, instruction, maxRisk }),
  });
  if (!res.ok) throw new Error("Failed to submit instruction");
  return res.json();
}

export async function getAgentStatus(address: string) {
  const res = await fetch(`${BASE_URL}/api/agent/status/${address}`);
  if (!res.ok) return null;
  return res.json();
}

export async function getPortfolio(address: string) {
  const res = await fetch(`${BASE_URL}/api/portfolio/${address}`);
  if (!res.ok) return null;
  return res.json();
}

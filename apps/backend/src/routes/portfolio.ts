import { Hono } from "hono";
import { getPortfolio } from "../lib/chain.js";
import { BASE_SEPOLIA_CONFIG } from "@autoyield/shared";

export const portfolioRouter = new Hono();

/// GET /api/portfolio/:address
portfolioRouter.get("/:address", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const { contracts, tokens } = BASE_SEPOLIA_CONFIG;

  const assets: `0x${string}`[] = [tokens.USDC, tokens.USDC];
  const adapters: `0x${string}`[] = [contracts.aaveAdapter, contracts.morphoAdapter];

  try {
    const [balances, apys] = await getPortfolio(address, assets, adapters);

    const positions = assets.map((asset, i) => ({
      asset,
      adapter: adapters[i],
      balance: balances[i].toString(),
      apy: Number(apys[i]),
    }));

    return c.json({ address, positions });
  } catch (err) {
    return c.json({ error: "Failed to fetch portfolio" }, 500);
  }
});

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const webhookRouter = new Hono();

/// POST /api/webhook/chainlink — Chainlink Automation callback (verify secret)
webhookRouter.post("/chainlink", async (c) => {
  const secret = c.req.header("x-chainlink-secret");
  if (secret !== process.env.CHAINLINK_WEBHOOK_SECRET) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  console.log("[Chainlink Webhook]", JSON.stringify(body));

  // Trigger yield decision cycle for the user
  // In production: enqueue job, call AutoYieldConsumer.requestYieldDecision()
  return c.json({ received: true });
});

/// POST /api/webhook/functions-result — Chainlink Functions result relay
webhookRouter.post("/functions-result", async (c) => {
  const body = await c.req.json();
  console.log("[Functions Result]", JSON.stringify(body));
  return c.json({ received: true });
});

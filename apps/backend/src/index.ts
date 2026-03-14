import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";

import { agentRouter } from "./routes/agent.js";
import { webhookRouter } from "./routes/webhook.js";
import { portfolioRouter } from "./routes/portfolio.js";

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: "*" }));

app.get("/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

app.route("/api/agent", agentRouter);
app.route("/api/webhook", webhookRouter);
app.route("/api/portfolio", portfolioRouter);

const port = Number(process.env.PORT) || 3001;
console.log(`🚀 AutoYield backend running on port ${port}`);

serve({ fetch: app.fetch, port });

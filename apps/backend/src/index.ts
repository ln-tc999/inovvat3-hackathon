import "./env.js"; // must be first — loads dotenv before any other module reads process.env
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { agentRouter } from "./routes/agent.js";
import { startAutomation } from "./services/automation.js";

const app = new Hono().basePath("/api");

// Middleware
app.use("*", cors({ origin: "*" }));
app.use("*", logger());

// Health check
app.get("/health", (c) => c.json({ status: "ok", ts: Date.now() }));

// Routes
app.route("/agent", agentRouter);

// Export typed app for hc<AppType> on frontend
export { app };
export type AppType = typeof app;

// Start server
const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🚀 Backend running at http://localhost:${port}`);
  // Start 24/7 automation: Chainlink event watcher + cron fallback
  startAutomation();
});

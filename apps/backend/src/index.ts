import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { agentRouter } from "./routes/agent.js";

config(); // load .env

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
});

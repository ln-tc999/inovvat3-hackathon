import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { agentRouter } from "./routes/agent.js";

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

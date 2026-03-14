// Bind Hono app to Astro API routes
// Astro passes APIContext, not a raw Request — unwrap it for Hono
export const prerender = false;

import type { APIContext } from "astro";
import { app } from "../../../../backend/src/index.js";

export async function ALL({ request }: APIContext) {
  return app.fetch(request);
}

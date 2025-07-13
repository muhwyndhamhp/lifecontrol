import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env } from "./env";

const apiApp = new Hono<{ Bindings: Env }>();

const app = new Hono<{ Bindings: Env }>()
  .use(
    "*",
    cors({
      origin: [
        "http://localhost:5173",
      ],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    })
  )
  .route("/api", apiApp)
  .get("*", HandleAssets);

export default app;

export type AppType = typeof app;


// To host the react app
export async function HandleAssets(c) {
  try {
    // Try to serve the requested asset first
    const assetResponse = await c.env.ASSETS.fetch(c.req.url);

    // If the asset exists and is not a 404, return it
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    // If asset doesn't exist, serve index.html for client-side routing
    const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
    return c.html(await indexResponse.text());
  } catch (error) {
    // Fallback to serving index.html if anything goes wrong
    const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
    return c.html(await indexResponse.text());
  }
}


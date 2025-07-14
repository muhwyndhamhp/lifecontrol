import { Context } from 'hono';
import { Env } from './env';

export async function handleAssets(c: Context<{ Bindings: Env }>) {
  try {
    const assetResponse = await c.env.ASSETS.fetch(c.req.url);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
    return c.html(await indexResponse.text());
  } catch (error) {
    const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
    return c.html(await indexResponse.text());
  }
}

import { hc, type InferRequestType, type InferResponseType } from 'hono/client';
import type { AppType } from '@server/index.ts';

export const client = hc<AppType>('http://localhost:5173');

export function rpcFetch<Fn extends (args: any) => Promise<Response>>(fn: Fn) {
  return (args: InferRequestType<Fn>) =>
    async (): Promise<InferResponseType<Fn>> => {
      const res = await fn(args);
      if (!res.ok) {
        throw new Error(`RPC call failed: ${res.status} ${res.statusText}`);
      }


      return res.json() as Promise<InferResponseType<Fn>>;
    };
}

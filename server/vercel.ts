/**
 * Production server entry for Vercel (Node.js runtime).
 *
 * Same request handling as server.ts (the Mini Oxygen entry used by
 * `npm run dev`): build the Hydrogen context, let React Router render, commit
 * the session cookie, fall back to Shopify's URL redirects on a 404. Only the
 * plumbing differs — Node's (req, res) instead of a Worker's fetch().
 *
 * Built by `npm run build:vercel`, which then packages it as a Vercel
 * function with scripts/vercel-output.mjs.
 */
import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler, storefrontRedirect} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {unavailablePage} from '~/lib/unavailable';

/**
 * Vercel keeps a function alive for promises passed to waitUntil (Hydrogen
 * uses it to refresh its cache after answering). This is the hook
 * @vercel/functions reads, without adding the dependency; outside Vercel the
 * promise simply runs on its own.
 */
function waitUntil(promise: Promise<unknown>) {
  const context = (
    globalThis as unknown as Record<
      symbol,
      {get?: () => {waitUntil?: (p: Promise<unknown>) => void}}
    >
  )[Symbol.for('@vercel/request-context')]?.get?.();
  if (context?.waitUntil) context.waitUntil(promise);
  else promise.catch((error) => console.error(error));
}

async function fetchHandler(request: Request): Promise<Response> {
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      process.env as unknown as Env,
      {waitUntil},
    );

    const handleRequest = createRequestHandler({
      build: serverBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.append(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return unavailablePage();
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const response = await fetchHandler(toRequest(req));
  await sendResponse(res, response);
}

function toRequest(req: IncomingMessage): Request {
  const protocol =
    (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  const url = new URL(req.url ?? '/', `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }

  const controller = new AbortController();
  req.once('aborted', () => controller.abort());

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? (Readable.toWeb(req) as ReadableStream) : undefined,
    signal: controller.signal,
    // Required by Node's fetch for a streamed request body.
    ...(hasBody ? {duplex: 'half'} : {}),
  } as RequestInit);
}

async function sendResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  res.statusMessage = response.statusText;

  const cookies = response.headers.getSetCookie();
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') res.setHeader(key, value);
  });
  if (cookies.length) res.setHeader('set-cookie', cookies);

  if (!response.body) {
    res.end();
    return;
  }

  // Streamed: Suspense boundaries reach the browser as soon as they resolve.
  const reader = response.body.getReader();
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      if (!res.write(value)) {
        await new Promise((resolve) => res.once('drain', resolve));
      }
    }
  } finally {
    res.end();
  }
}

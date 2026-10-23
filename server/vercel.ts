/**
 * Production server entry for Vercel (Node.js runtime): React Router renders
 * each request. Node's (req, res) are turned into a web Request / Response.
 *
 * Built by `npm run build:vercel`, which then packages it as a Vercel
 * function with scripts/vercel-output.mjs.
 */
import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler} from 'react-router';
import {unavailablePage} from '~/lib/unavailable';

const handleRequest = createRequestHandler(serverBuild, process.env.NODE_ENV);

async function fetchHandler(request: Request): Promise<Response> {
  try {
    return await handleRequest(request);
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

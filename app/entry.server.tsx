import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
// The web-streams renderer, in dev (Node) as on Vercel.
import {renderToReadableStream} from 'react-dom/server.browser';
import type {EntryContext} from 'react-router';
import {NonceProvider} from '~/lib/nonce';

/**
 * Strict Content-Security-Policy: only this site's own scripts, styles,
 * fonts and images (plus the nonce'd inline scripts React Router writes).
 * Forms post here only; nobody may frame the site.
 */
function contentSecurityPolicy(nonce: string, dev: boolean) {
  const self = dev ? "'self' ws: http://localhost:*" : "'self'";
  return [
    `default-src ${self}`,
    `script-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `media-src 'self' blob:`,
    `connect-src ${self}`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
  ].join('; ');
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  const nonce = crypto.randomUUID().replace(/-/g, '');

  const body = await renderToReadableStream(
    <NonceProvider value={nonce}>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicy(nonce, import.meta.env.DEV),
  );

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

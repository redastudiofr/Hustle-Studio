import {BRAND} from '~/config/brand';

/**
 * Last-resort page, served by the server entry when the app could not even
 * start rendering (missing environment variables, Shopify unreachable while
 * building the context). Plain HTML, no JavaScript, no dependency on anything
 * that might be what failed. The real error is in the server logs.
 */
export function unavailablePage(): Response {
  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${BRAND.name}</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;text-align:center;padding:24px;box-sizing:border-box}
  h1{font-size:1.25rem;margin:0 0 .75rem;text-transform:lowercase}
  p{margin:0 0 1.5rem;color:#666;font-size:.95rem;line-height:1.5}
  a{display:inline-block;padding:.85rem 1.5rem;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-size:.8rem;text-transform:lowercase}
</style>
</head>
<body>
<main>
<h1>${BRAND.name}</h1>
<p>La boutique est momentanément indisponible. Réessayez dans quelques instants.<br>The store is temporarily unavailable. Please try again shortly.</p>
<a href="/">Réessayer / Retry</a>
</main>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: {'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '30'},
  });
}

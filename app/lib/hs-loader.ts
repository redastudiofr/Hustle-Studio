/**
 * Opening loader — the critical parts that must run before the first paint.
 *
 * Shown on every full page load (desktop and phone), never on in-app
 * navigation. With prefers-reduced-motion it is a plain fade, nothing moves. The overlay's markup is
 * rendered by app/components/hs/HsLoader.tsx; it stays `display: none` unless
 * HS_LOADER_SCRIPT (inlined in <head>) marks the document with
 * `hs-loader-run`. Everything is CSS animation: no asset, no library, nothing
 * waits on the loader, and if JavaScript never runs the overlay never shows.
 *
 * Timeline (total 1.75s, removed at 1.8s), no black anywhere:
 *   0s     a white screen; the site's own wordmark (BRAND.logo.wordmark,
 *          painted through a CSS mask, the same file as the header) fades in
 *   0.95s  the whole overlay goes from opaque to transparent (0.8s), leaving
 *          the page clean underneath
 */

/** How long the overlay stays in the document, in ms. */
export const HS_LOADER_DURATION_MS = 1800;


/**
 * Runs in <head>, before the body is parsed. Decides whether the loader
 * plays, locks scrolling while it does, and unlocks after it — on its own, so
 * a failed hydration can never leave the page locked.
 */
export const HS_LOADER_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('hs-loader-run');window.__hsLoaderStart=Date.now();setTimeout(function(){d.classList.remove('hs-loader-run');},${HS_LOADER_DURATION_MS});})();`;

/** Critical CSS of the overlay, inlined in <head>. */
export const HS_LOADER_CSS = `
.hs-loader{--hs-ease:cubic-bezier(.4,0,.2,1);position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:#fff;color:#111;opacity:1;pointer-events:none}
html.hs-loader-run .hs-loader{display:flex;animation:hs-loader-clear .8s var(--hs-ease) .95s forwards}
html.hs-loader-run,html.hs-loader-run body{overflow:hidden}
.hs-loader__logo{display:block;width:min(360px,64vw);aspect-ratio:1200/441;background:currentColor;-webkit-mask:var(--brand-wordmark) center/contain no-repeat;mask:var(--brand-wordmark) center/contain no-repeat}
html.hs-loader-run .hs-loader__logo{animation:hs-loader-logo 1.75s var(--hs-ease) forwards}
@keyframes hs-loader-clear{to{opacity:0}}
@keyframes hs-loader-logo{0%{opacity:0;transform:scale(.97)}25%{opacity:1;transform:none}100%{opacity:1;transform:scale(1.02)}}
@media (prefers-reduced-motion:reduce){html.hs-loader-run .hs-loader__logo{animation:none}}
`;

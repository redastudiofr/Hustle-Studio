/**
 * Opening loader — the critical parts that must run before the first paint.
 *
 * Shown only on the first page load of a browser session, never on in-app
 * navigation, never with prefers-reduced-motion. The overlay's markup is
 * rendered by app/components/hs/HsLoader.tsx; it stays `display: none` unless
 * HS_LOADER_SCRIPT (inlined in <head>) marks the document with
 * `hs-loader-run`. Everything is CSS animation: no asset, no library, nothing
 * waits on the loader, and if JavaScript never runs the overlay never shows.
 *
 * Timeline (total 1.75s, removed at 1.8s):
 *   0s     the site's own wordmark (BRAND.logo.wordmark, painted through a
 *          CSS mask) is written left to right — a clip-path wipe, like the
 *          signature it is — while it settles up into place
 *   0.1s   the 160px line fills left to right (1s)
 *   1.15s  the overlay leaves upwards (clip-path, 0.6s); its content rises
 *          48px and fades out
 */

/** How long the overlay stays in the document, in ms. */
export const HS_LOADER_DURATION_MS = 1800;

/** sessionStorage key marking that the loader has played this session. */
const SEEN_KEY = 'hs-loader-seen';

/**
 * Runs in <head>, before the body is parsed. Decides whether the loader
 * plays, locks scrolling while it does, and unlocks after it — on its own, so
 * a failed hydration can never leave the page locked.
 */
export const HS_LOADER_SCRIPT = `(function(){var d=document.documentElement;try{if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(window.sessionStorage.getItem('${SEEN_KEY}'))return;window.sessionStorage.setItem('${SEEN_KEY}','1');}catch(e){return;}d.classList.add('hs-loader-run');window.__hsLoaderStart=Date.now();setTimeout(function(){d.classList.remove('hs-loader-run');},${HS_LOADER_DURATION_MS});})();`;

/** Critical CSS of the overlay, inlined in <head>. */
export const HS_LOADER_CSS = `
.hs-loader{--hs-loader-bg:#0D0D0D;--hs-loader-fg:#F2F0EB;--hs-ease-out:cubic-bezier(.2,.8,.2,1);--hs-ease-inout:cubic-bezier(.7,0,.2,1);position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:var(--hs-loader-bg);color:var(--hs-loader-fg);clip-path:inset(0 0 0 0)}
html.hs-loader-run .hs-loader{display:flex;animation:hs-loader-exit .6s var(--hs-ease-inout) 1.15s forwards}
html.hs-loader-run,html.hs-loader-run body{overflow:hidden}
.hs-loader__inner{display:flex;flex-direction:column;align-items:center}
html.hs-loader-run .hs-loader__inner{animation:hs-loader-inner-out .6s var(--hs-ease-inout) 1.15s forwards}
.hs-loader__logo{display:block;width:min(420px,72vw);aspect-ratio:1200/441;background:var(--hs-loader-fg);-webkit-mask:var(--brand-wordmark) center/contain no-repeat;mask:var(--brand-wordmark) center/contain no-repeat;clip-path:inset(0 100% 0 0);transform:translateY(14px) scale(.96)}
html.hs-loader-run .hs-loader__logo{animation:hs-loader-write 1s var(--hs-ease-inout) forwards,hs-loader-settle .9s var(--hs-ease-out) forwards}
.hs-loader__line{display:block;width:160px;height:1px;margin-top:1.4rem;background:var(--hs-loader-fg);transform:scaleX(0);transform-origin:0 50%;opacity:.7}
html.hs-loader-run .hs-loader__line{animation:hs-loader-line 1s var(--hs-ease-inout) .1s forwards}
@keyframes hs-loader-write{to{clip-path:inset(0 0 0 0)}}
@keyframes hs-loader-settle{to{transform:none}}
@keyframes hs-loader-line{to{transform:scaleX(1)}}
@keyframes hs-loader-exit{to{clip-path:inset(0 0 100% 0)}}
@keyframes hs-loader-inner-out{to{transform:translateY(-48px);opacity:0}}
@media (prefers-reduced-motion:reduce){.hs-loader{display:none!important}}
`;

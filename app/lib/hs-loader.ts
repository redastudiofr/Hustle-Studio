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
 *   0s     HUSTLE letters rise from a mask, 55ms apart (0.7s each)
 *   0s     the 160px line fills left to right (1s)
 *   0.35s  STUDIO fades in while its letter-spacing opens (0.8s)
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
.hs-loader__word{display:flex;margin:0;overflow:hidden;font-family:var(--font-display,'Archivo','Arial Narrow',Arial,sans-serif);font-size:clamp(3.4rem,13vw,8.5rem);font-weight:800;line-height:1;letter-spacing:.01em;text-transform:uppercase}
.hs-loader__letter{display:inline-block;transform:translateY(110%)}
html.hs-loader-run .hs-loader__letter{animation:hs-loader-rise .7s var(--hs-ease-out) forwards;animation-delay:calc(var(--i) * 55ms)}
.hs-loader__sub{margin:.9rem 0 0;padding-left:.6em;font-family:var(--font-display,'Archivo','Arial Narrow',Arial,sans-serif);font-size:clamp(.8rem,2.4vw,1.05rem);font-weight:700;line-height:1;letter-spacing:.2em;text-transform:uppercase;opacity:0}
html.hs-loader-run .hs-loader__sub{animation:hs-loader-sub .8s var(--hs-ease-out) .35s forwards}
.hs-loader__line{display:block;width:160px;height:1px;margin-top:1.2rem;background:var(--hs-loader-fg);transform:scaleX(0);transform-origin:0 50%}
html.hs-loader-run .hs-loader__line{animation:hs-loader-line 1s var(--hs-ease-inout) forwards}
@keyframes hs-loader-rise{to{transform:translateY(0)}}
@keyframes hs-loader-sub{to{opacity:1;letter-spacing:.6em}}
@keyframes hs-loader-line{to{transform:scaleX(1)}}
@keyframes hs-loader-exit{to{clip-path:inset(0 0 100% 0)}}
@keyframes hs-loader-inner-out{to{transform:translateY(-48px);opacity:0}}
@media (prefers-reduced-motion:reduce){.hs-loader{display:none!important}}
`;

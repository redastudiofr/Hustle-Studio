/**
 * Packages the Vite build as a Vercel deployment (Build Output API v3).
 *
 *   dist/client  →  .vercel/output/static            (served from Vercel's CDN)
 *   dist/server  →  .vercel/output/functions/index.func  (one Node.js function)
 *
 * Every request that is not a static file goes to the function, which renders
 * the storefront. Run by `npm run build:vercel`; Vercel picks up
 * .vercel/output automatically after the build command.
 * Spec: https://vercel.com/docs/build-output-api
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';

const out = '.vercel/output';
const fn = `${out}/functions/index.func`;

if (!existsSync('dist/client') || !existsSync('dist/server/index.js')) {
  console.error('dist/ is missing — run the Vite build first.');
  process.exit(1);
}

rmSync(out, {recursive: true, force: true});
mkdirSync(fn, {recursive: true});

cpSync('dist/client', `${out}/static`, {recursive: true});
cpSync('dist/server', fn, {recursive: true});
// The server bundle is ESM; tell Node so without renaming files.
writeFileSync(`${fn}/package.json`, JSON.stringify({type: 'module'}));

writeFileSync(
  `${fn}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.js',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

writeFileSync(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Hashed build assets never change: cache them for a year.
        {
          src: '^/assets/(.*)$',
          headers: {'cache-control': 'public, max-age=31536000, immutable'},
          continue: true,
        },
        {handle: 'filesystem'},
        {src: '/(.*)', dest: '/index'},
      ],
    },
    null,
    2,
  ),
);

const files = readdirSync(fn);
console.log(
  `Vercel output ready: ${out} (function files: ${files.join(', ')})`,
);

import {fileURLToPath} from 'node:url';
import {defineConfig, loadEnv} from 'vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * `npm run dev`: React Router's dev server. `npm run build:vercel`
 * (TARGET=vercel): a self-contained Node.js bundle of server/vercel.ts for
 * Vercel — see scripts/vercel-output.mjs.
 */
const vercel = process.env.TARGET === 'vercel';

export default defineConfig(({isSsrBuild, mode}) => {
  // Local development: the server reads .env like Vercel's variables.
  if (mode === 'development') {
    Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./app', import.meta.url)),
      },
      tsconfigPaths: true,
    },
    build: {
      // Allow a strict Content-Security-Policy
      // without inlining assets as base64:
      assetsInlineLimit: 0,
      // No `target` override here: it would also change how CSS is minified,
      // giving the server a different stylesheet hash than the client.
      ...(vercel && isSsrBuild
        ? {rollupOptions: {input: './server/vercel.ts'}}
        : {}),
    },
    ssr: {
      // On Vercel the function ships without node_modules: bundle everything,
      // with react-dom's web-streams renderer (renderToReadableStream).
      ...(vercel
        ? {
            noExternal: true,
            target: 'node' as const,
            resolve: {
              conditions: ['worker', 'module', 'production'],
              externalConditions: ['worker'],
            },
          }
        : {}),
    },
  };
});

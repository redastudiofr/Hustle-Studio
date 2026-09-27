import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Two targets share this config:
 * - `npm run dev` / `npm run build`: Shopify's Mini Oxygen worker (server.ts),
 *   used for local development.
 * - `npm run build:vercel` (TARGET=vercel): a self-contained Node.js bundle
 *   of server/vercel.ts for Vercel — see scripts/vercel-output.mjs.
 */
const vercel = process.env.TARGET === 'vercel';

export default defineConfig(({isSsrBuild}) => ({
  plugins: [tailwindcss(), hydrogen(), vercel ? null : oxygen(), reactRouter()],
  resolve: {
    alias: {
      // Vite's native tsconfig path resolver does not cover JavaScript
      // projects that use jsconfig.json, so define Hydrogen's app alias here.
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
    // resolving packages the way Oxygen's worker build does (react-dom's
    // streaming renderer only exists in its worker/browser build). Node 22
    // has every web API those builds use.
    ...(vercel
      ? {
          noExternal: true,
          target: 'node' as const,
          resolve: {
            conditions: ['workerd', 'worker', 'module', 'production'],
            externalConditions: ['workerd', 'worker'],
          },
        }
      : {}),
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
}));

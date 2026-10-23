import type {Config} from '@react-router/dev/config';

/** Server-rendered React Router app, packaged for Vercel (see vite.config.ts). */
export default {
  buildDirectory: 'dist',
  ssr: true,
  future: {
    v8_splitRouteModules: true,
  },
} satisfies Config;

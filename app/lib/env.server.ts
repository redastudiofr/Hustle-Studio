/**
 * Server-only settings, read from environment variables (set them in Vercel
 * → Settings → Environment Variables; locally in .env). The full list is in
 * .env.example. Never import this from browser code.
 */
export function serverEnv(): Env {
  return process.env as unknown as Env;
}

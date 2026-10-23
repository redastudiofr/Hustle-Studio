/// <reference types="vite/client" />
/// <reference types="react-router" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Server-only environment variables (read through app/lib/env.server.ts).
   * The full list with explanations is in .env.example.
   */
  interface Env {
    RESEND_API_KEY?: string;
    NOTIFICATION_EMAIL?: string;
  }
}

export {};

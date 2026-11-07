/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Environment variables. Hydrogen already declares the Shopify ones
   * (PUBLIC_STORE_DOMAIN, PUBLIC_STOREFRONT_API_TOKEN, SESSION_SECRET, …);
   * the full list with explanations is in .env.example.
   */
  interface Env {
    // Optional, server-only — see .env.example and docs/PROMOTIONS.md.
    /** Apps Script web app of the pop-up's Google Sheet (docs/POPUP.md). */
    GOOGLE_SHEET_WEBHOOK_URL?: string;
    RESEND_API_KEY?: string;
    NOTIFICATION_EMAIL?: string;
  }
}

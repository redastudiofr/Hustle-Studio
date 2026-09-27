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
  interface Env {}
}

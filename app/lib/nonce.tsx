import {createContext, useContext} from 'react';

/**
 * The Content-Security-Policy nonce of the current page: set on the server
 * (app/entry.server.tsx), read back from the page's scripts in the browser
 * (app/entry.client.tsx). Inline scripts need it to run.
 */
const NonceContext = createContext<string | undefined>(undefined);

export const NonceProvider = NonceContext.Provider;

export function useNonce() {
  return useContext(NonceContext);
}

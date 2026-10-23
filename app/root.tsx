import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
import siteStyles from '~/styles/site.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';
import {I18nProvider} from '~/lib/i18n';
import {useNonce} from '~/lib/nonce';
import {
  DEFAULT_LOCALE,
  localeChosen as hasLocaleChoice,
  localeFromRequest,
} from '~/lib/i18n/locale';
import {BRAND} from '~/config/brand';
import {isInAppBrowser} from '~/lib/inAppBrowser';
import {PROMO_POPUP_ACTIVE} from '~/lib/newsletterPromo';
import {serverEnv} from '~/lib/env.server';
import {seoMeta} from '~/lib/seo';
import {ErrorPage} from '~/components/ErrorPage';

export type RootLoader = typeof loader;

/** The root data only depends on cookies: refresh it after a form post. */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  return false;
};

/**
 * Favicon served from /public so the logo can be swapped by replacing the
 * files (see app/config/brand.ts).
 */
export function links() {
  return [
    {rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png'},
    {rel: 'icon', sizes: '48x48', href: '/favicon.ico'},
    {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},
  ];
}

/** Defaults for any route that does not declare its own meta. */
export const meta: Route.MetaFunction = ({data}) =>
  seoMeta({origin: data?.origin, path: '/'});

export function loader({request}: Route.LoaderArgs) {
  return {
    locale: localeFromRequest(request),
    // Whether the language question was ever answered — the prompt is
    // rendered only when it wasn't.
    localeChosen: hasLocaleChoice(request),
    origin: new URL(request.url).origin,
    // TikTok's and Instagram's own browsers throw inline video full screen;
    // the video carousel is skipped there — see app/lib/inAppBrowser.ts.
    inAppBrowser: isInAppBrowser(request.headers.get('user-agent')),
    // Only a yes/no reaches the browser: whether the welcome pop-up is on
    // (app/config/promotions.ts) and Resend can e-mail each number to the
    // shop's inbox. The key itself never leaves the server.
    promoSignupEnabled:
      PROMO_POPUP_ACTIVE && Boolean(serverEnv().RESEND_API_KEY),
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  // Read here rather than passed down, because Layout also wraps the error
  // boundary, where the loader data may be absent — hence the fallback.
  const data = useRouteLoaderData<RootLoader>('root');
  const locale = data?.locale ?? DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      // The header and footer paint the wordmark through a CSS mask; its file
      // comes from app/config/brand.ts rather than being hardcoded in CSS.
      style={
        {
          '--brand-wordmark': `url(${BRAND.logo.wordmark})`,
        } as React.CSSProperties
      }
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={BRAND.themeColor} />
        <link rel="stylesheet" href={tailwindCss}></link>
        {/* reset → app → promotions → brand → editorial → pdp, one file. */}
        <link rel="stylesheet" href={siteStyles}></link>
        {/* The two latin font files every page uses (app/config/theme.css):
            body text and the header. */}
        <link
          rel="preload"
          href="/fonts/inter-tight-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <Meta />
        <Links />
        {/*
          Marks the document as "JavaScript is running" before the page paints.
          The scroll-reveal animation hides its sections until JavaScript says
          otherwise (see .reveal in app.css), so without this flag a script
          that never ran — or hydration that failed — left whole rows of
          products invisible with no way back. Everything is visible by
          default now; the animation is the enhancement, not the condition.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <I18nProvider locale={locale}>{children}</I18nProvider>
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <PageLayout {...data}>
      <Outlet />
    </PageLayout>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  if (!isRouteErrorResponse(error)) console.error(error);
  return <ErrorPage status={status} />;
}

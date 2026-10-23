import type {Route} from './+types/[sitemap.xml]';
import {NAVIGATION} from '~/config/navigation';

/** Every public page of the site — a showcase, so the list is fixed. */
const PATHS = [
  '/',
  '/about',
  '/contact',
  '/faq',
  ...NAVIGATION.footer.policies.map((link) => link.to),
];

export function loader({request}: Route.LoaderArgs) {
  const origin = new URL(request.url).origin;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PATHS.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

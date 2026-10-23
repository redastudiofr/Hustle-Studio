import type {Route} from './+types/[robots.txt]';

export function loader({request}: Route.LoaderArgs) {
  const {origin} = new URL(request.url);
  const body = `User-agent: *
Disallow: /newsletter
Disallow: /locale

Sitemap: ${origin}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

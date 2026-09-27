import type {Route} from './+types/$';
import {ErrorPage} from '~/components/ErrorPage';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({title: '404', noindex: true});

export async function loader({request}: Route.LoaderArgs) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  return <ErrorPage status={404} />;
}

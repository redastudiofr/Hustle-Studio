import {redirect} from 'react-router';
import type {Route} from './+types/$';
import {ErrorPage} from '~/components/ErrorPage';
import {seoMeta} from '~/lib/seo';

export const meta: Route.MetaFunction = () =>
  seoMeta({title: '404', noindex: true});

/**
 * Pages of the former online shop: links to them (search engines, shared
 * links, bookmarks) land on the homepage rather than on an error.
 */
const FORMER_SHOP =
  /^\/(products|collections|cart|account|search|pack|discount|pages|blogs|policies|order-tracking|reviews)(\/|$)/;

export async function loader({request}: Route.LoaderArgs) {
  const {pathname} = new URL(request.url);
  if (FORMER_SHOP.test(pathname)) throw redirect('/', 301);
  throw new Response(`${pathname} not found`, {status: 404});
}

export default function CatchAllPage() {
  return null;
}

export function ErrorBoundary() {
  return <ErrorPage status={404} />;
}

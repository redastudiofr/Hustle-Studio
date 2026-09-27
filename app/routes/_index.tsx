import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {HOME_SECTIONS} from '~/config/home';
import {HomeSections} from '~/components/home/HomeSections';
import {loadHomeSections} from '~/lib/homeSections';
import {seoMeta, originFromMatches} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({path: '/', origin: originFromMatches(matches)});

/** Preloads the hero photo (the page's LCP element) when one is configured. */
export function links() {
  const hero = HOME_SECTIONS.find((section) => section.type === 'hero');
  if (!hero || hero.type !== 'hero' || !hero.image) return [];
  const {desktop, mobile} = hero.image;
  return [
    {
      rel: 'preload',
      as: 'image',
      href: mobile ?? desktop,
      media: '(max-width: 47.99em)',
    },
    {rel: 'preload', as: 'image', href: desktop, media: '(min-width: 48em)'},
  ];
}

/**
 * The homepage is entirely described by app/config/home.ts. Every Shopify
 * request is started here and streamed: the hero renders immediately, each
 * product section fills in as its data arrives.
 */
export async function loader({context}: Route.LoaderArgs) {
  return {sections: loadHomeSections(context.storefront, HOME_SECTIONS)};
}

export default function Homepage() {
  const {sections} = useLoaderData<typeof loader>();

  return (
    <div className="home">
      <HomeSections sections={HOME_SECTIONS} data={sections} />
    </div>
  );
}

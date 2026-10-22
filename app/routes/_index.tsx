import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {HOME} from '~/config/homeTemplate';
import {DUO, DUO_LIVE} from '~/lib/homeDuo';
import {LIVE_TEE_PACKS} from '~/lib/teePacks';
import {loadLanding} from '~/lib/landing';
import {useLocalized} from '~/lib/i18n/localized';
import {HeroSplit, ScrollingBand} from '~/components/landing/HeroSplit';
import {BestSellerVs} from '~/components/landing/BestSellerVs';
import {DuoOffer} from '~/components/landing/DuoOffer';
import {Community} from '~/components/landing/Community';
import {Podium} from '~/components/landing/Podium';
import {MediaCarousel} from '~/components/landing/MediaCarousel';
import {seoMeta, originFromMatches} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({path: '/', origin: originFromMatches(matches)});

/** Preloads the first hero photo — the page's LCP element. */
export function links() {
  const first = HOME.hero[0];
  return first ? [{rel: 'preload', as: 'image', href: first.image}] : [];
}

/**
 * Homepage (mock-ups 01–07, see docs/HOME_PAGE.md): texts in
 * app/config/homeTemplate.ts, products from Shopify. A section without real
 * data behind it is not rendered. The previous, config-driven homepage
 * (app/config/home.ts + components/home/) is kept, unused.
 */
export async function loader({context}: Route.LoaderArgs) {
  const landing = await loadLanding(context.storefront, {
    bestSeller: HOME.bestSeller.handles,
    duo: DUO.handles,
  });
  return {
    ...landing,
    hero: HOME.hero.filter((panel) =>
      landing.collections.includes(panel.collection),
    ),
  };
}

export default function Homepage() {
  const {hero, bestSellers, vs, duo} = useLoaderData<typeof loader>();
  const l = useLocalized();
  const packsLive = LIVE_TEE_PACKS.length > 0;
  const band = HOME.band
    .filter((item) => !item.needsPack || packsLive)
    .map((item) => l(item.text));

  return (
    <div className="hx">
      <HeroSplit panels={hero} />
      <ScrollingBand items={band} />
      <BestSellerVs products={vs} />
      {DUO_LIVE && duo.length >= 2 && (
        <DuoOffer products={[duo[0], duo[1]]} />
      )}
      <Community photos={HOME.community.photos} />
      <Podium products={bestSellers} />
      <MediaCarousel cards={HOME.media.cards} logos={HOME.media.logos} />
    </div>
  );
}

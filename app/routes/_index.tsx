import type {Route} from './+types/_index';
import {HOME} from '~/config/homeTemplate';
import {useLocalized} from '~/lib/i18n/localized';
import {HeroSplit, ScrollingBand} from '~/components/landing/HeroSplit';
import {Community} from '~/components/landing/Community';
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
 * Homepage (see docs/HOME_PAGE.md): every text and photo in
 * app/config/homeTemplate.ts. A section without real content behind it is
 * not rendered.
 */
export default function Homepage() {
  const l = useLocalized();

  return (
    <div className="hx">
      <HeroSplit panels={HOME.hero} />
      <ScrollingBand items={HOME.band.map(l)} />
      <Community photos={HOME.community.photos} />
      <MediaCarousel cards={HOME.media.cards} logos={HOME.media.logos} />
    </div>
  );
}

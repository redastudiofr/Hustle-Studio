import {useLoaderData} from 'react-router';
import type {Route} from './+types/sets.$slug';
import {ProductGallery} from '~/components/reda/ProductGallery';
import {SetPurchase} from '~/components/sets/SetPurchase';
import {loadSets, type SetImage} from '~/lib/sets';
import {seoMeta, originFromMatches} from '~/lib/seo';

/**
 * A 07 set: the Zip 07 and the Jogging 07 of one colour, sold together at
 * the sum of their Shopify prices (app/config/sets.ts, app/lib/sets.ts).
 */
export const meta: Route.MetaFunction = ({data, matches}) =>
  seoMeta({
    title: data?.set.title ?? 'set',
    description: data
      ? `${data.set.jacketPiece.title} + ${data.set.sweatsPiece.title}, in your sizes.`
      : undefined,
    path: data ? `/sets/${data.set.slug}` : '/sets',
    origin: originFromMatches(matches),
  });

export async function loader({context, params}: Route.LoaderArgs) {
  const sets = await loadSets(context.storefront);
  const set = sets.find((item) => item.slug === params.slug);
  if (!set) throw new Response(null, {status: 404});
  return {set, others: sets.filter((item) => item.slug !== set.slug)};
}

export default function SetPage() {
  const {set, others} = useLoaderData<typeof loader>();

  // The set worn first, then each piece's own photos, each photo once.
  const seen = new Set<string>();
  const images = [
    ...(set.image ? [set.image] : []),
    ...set.jacketPiece.images,
    ...set.sweatsPiece.images,
  ].filter((image: SetImage) => {
    const key = image.url.split('?')[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="pdp rpdp hs-set">
      <div className="pdp__main">
        <div className="pdp__gallery">
          <ProductGallery
            key={set.slug}
            images={images.map((image) => ({...image, id: image.url}))}
            title={set.title}
          />
        </div>
        <aside className="pdp__buy">
          <SetPurchase set={set} others={others} />
        </aside>
      </div>
    </div>
  );
}

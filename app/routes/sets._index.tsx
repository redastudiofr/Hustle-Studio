import {useLoaderData} from 'react-router';
import type {Route} from './+types/sets._index';
import {SetsGrid} from '~/components/sets/SetsGrid';
import {loadSets} from '~/lib/sets';
import {seoMeta, originFromMatches} from '~/lib/seo';

export const meta: Route.MetaFunction = ({matches}) =>
  seoMeta({
    title: 'the sets',
    description: 'The 07 sets: zip hoodie and matching joggers, in your sizes.',
    path: '/sets',
    origin: originFromMatches(matches),
  });

export async function loader({context}: Route.LoaderArgs) {
  return {sets: await loadSets(context.storefront)};
}

export default function SetsPage() {
  const {sets} = useLoaderData<typeof loader>();
  return (
    <div className="hs-sets-page">
      <SetsGrid sets={sets} />
    </div>
  );
}
